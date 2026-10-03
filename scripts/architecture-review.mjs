#!/usr/bin/env node
// Local planning and declared-measurement report. No providers or external actions.
import { createHash } from 'node:crypto';
import { closeSync, constants, fstatSync, openSync, readFileSync, readSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MAX_BYTES = 1024 * 1024;
const sha256 = value => createHash('sha256').update(value).digest('hex');
const fail = path => { throw new Error(`Invalid field: ${path}`); };
const text = (value, path) => {
  if (typeof value !== 'string' || !value.trim() || value.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) fail(path);
};
const number = (value, path, max = 1_000_000) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) fail(path);
};
const object = (value, keys, path) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail(path);
  if (Object.keys(value).length !== keys.length || keys.some(key => !Object.hasOwn(value, key))) fail(path);
};
const array = (value, path, min = 1, max = 100) => {
  if (!Array.isArray(value) || value.length < min || value.length > max) fail(path);
};
const strings = (value, path) => { array(value, path); value.forEach((item, i) => text(item, `${path}[${i}]`)); };
const unique = (rows, key, path) => { if (new Set(rows.map(row => row[key])).size !== rows.length) fail(path); };

export function validateDecision(input) {
  object(input, ['schemaVersion', 'title', 'buyer', 'userJob', 'activation', 'constraints', 'options', 'chosenOption', 'trustBoundaries', 'failureTests', 'rollback', 'export', 'communityContribution', 'stopRule', 'economics', 'evidenceMode', 'observationWindow', 'observations'], 'decision');
  if (input.schemaVersion !== 1) fail('schemaVersion');
  for (const key of ['title', 'buyer', 'userJob', 'activation', 'chosenOption', 'rollback', 'export', 'communityContribution', 'stopRule']) text(input[key], key);
  strings(input.constraints, 'constraints');
  array(input.options, 'options', 2);
  input.options.forEach((option, i) => {
    object(option, ['id', 'name', 'advantage', 'tradeoff'], `options[${i}]`);
    for (const key of ['id', 'name', 'advantage', 'tradeoff']) text(option[key], `options[${i}].${key}`);
  });
  unique(input.options, 'id', 'options.id');
  if (!input.options.some(option => option.id === input.chosenOption)) fail('chosenOption');
  array(input.trustBoundaries, 'trustBoundaries');
  input.trustBoundaries.forEach((boundary, i) => {
    object(boundary, ['name', 'reads', 'writes', 'approval'], `trustBoundaries[${i}]`);
    for (const key of ['name', 'reads', 'writes', 'approval']) text(boundary[key], `trustBoundaries[${i}].${key}`);
  });
  array(input.failureTests, 'failureTests');
  input.failureTests.forEach((test, i) => {
    object(test, ['id', 'trigger', 'expected', 'recovery'], `failureTests[${i}]`);
    for (const key of ['id', 'trigger', 'expected', 'recovery']) text(test[key], `failureTests[${i}].${key}`);
  });
  unique(input.failureTests, 'id', 'failureTests.id');
  const e = input.economics;
  object(e, ['currency', 'monthlyAttempts', 'expectedAcceptanceRate', 'inputTokensPerAttempt', 'outputTokensPerAttempt', 'inputRatePerMillion', 'outputRatePerMillion', 'fixedMonthlyCash', 'humanMinutesPerAttempt', 'hourlyTimeValue', 'monthlyCashLimit'], 'economics');
  if (!['EUR', 'USD', 'GBP'].includes(e.currency)) fail('economics.currency');
  for (const key of Object.keys(e).filter(key => key !== 'currency')) number(e[key], `economics.${key}`);
  if (!Number.isInteger(e.monthlyAttempts)) fail('economics.monthlyAttempts');
  for (const key of ['inputTokensPerAttempt', 'outputTokensPerAttempt']) if (!Number.isInteger(e[key])) fail(`economics.${key}`);
  if (e.expectedAcceptanceRate > 1) fail('economics.expectedAcceptanceRate');
  if (!['none', 'illustrative', 'declared'].includes(input.evidenceMode)) fail('evidenceMode');
  array(input.observations, 'observations', 0, 1000);
  if (input.observations.length === 0) {
    if (input.evidenceMode !== 'none' || input.observationWindow !== null) fail('evidenceMode');
  } else {
    if (input.evidenceMode === 'none') fail('evidenceMode');
    text(input.observationWindow, 'observationWindow');
  }
  input.observations.forEach((attempt, i) => {
    const path = `observations[${i}]`;
    object(attempt, ['attemptId', 'outcome', 'modelCash', 'infrastructureCash', 'humanMinutes', 'baselineMinutes', 'evidenceRef'], path);
    text(attempt.attemptId, `${path}.attemptId`);
    if (!['accepted', 'rejected', 'failed'].includes(attempt.outcome)) fail(`${path}.outcome`);
    for (const key of ['modelCash', 'infrastructureCash', 'humanMinutes']) number(attempt[key], `${path}.${key}`);
    if (attempt.baselineMinutes !== null) number(attempt.baselineMinutes, `${path}.baselineMinutes`);
    text(attempt.evidenceRef, `${path}.evidenceRef`);
  });
  unique(input.observations, 'attemptId', 'observations.attemptId');
  return input;
}

export function analyzeDecision(input) {
  validateDecision(input);
  const e = input.economics;
  const modelCashPerAttempt = (e.inputTokensPerAttempt * e.inputRatePerMillion + e.outputTokensPerAttempt * e.outputRatePerMillion) / 1_000_000;
  const forecastCash = e.monthlyAttempts * modelCashPerAttempt + e.fixedMonthlyCash;
  const forecastHumanMinutes = e.monthlyAttempts * e.humanMinutesPerAttempt;
  const forecastTotal = forecastCash + forecastHumanMinutes * e.hourlyTimeValue / 60;
  const forecastAccepted = e.monthlyAttempts * e.expectedAcceptanceRate;
  const forecastCashPerAccepted = forecastAccepted > 0 ? forecastCash / forecastAccepted : null;
  const forecastTotalPerAccepted = forecastAccepted > 0 ? forecastTotal / forecastAccepted : null;
  if ([forecastCashPerAccepted, forecastTotalPerAccepted].some(value => value !== null && !Number.isFinite(value))) fail('economics.expectedAcceptanceRate');
  const accepted = input.observations.filter(attempt => attempt.outcome === 'accepted');
  const cash = input.observations.reduce((total, attempt) => total + attempt.modelCash + attempt.infrastructureCash, 0);
  const humanMinutes = input.observations.reduce((total, attempt) => total + attempt.humanMinutes, 0);
  const total = cash + humanMinutes * e.hourlyTimeValue / 60;
  const hasBaseline = accepted.length > 0 && accepted.every(attempt => attempt.baselineMinutes !== null);
  const savedMinutes = hasBaseline ? accepted.reduce((sum, attempt) => sum + attempt.baselineMinutes, 0) - humanMinutes : null;
  return {
    evidenceState: input.evidenceMode === 'none' ? 'FORECAST_ONLY' : input.evidenceMode === 'illustrative' ? 'ILLUSTRATIVE_OBSERVATIONS' : 'DECLARED_OBSERVATIONS_NOT_VERIFIED',
    currency: e.currency,
    forecast: {
      attempts: e.monthlyAttempts, accepted: forecastAccepted, cash: forecastCash,
      humanMinutes: forecastHumanMinutes, totalWithTime: forecastTotal,
      cashPerAccepted: forecastCashPerAccepted,
      totalPerAccepted: forecastTotalPerAccepted,
      monthlyCashLimit: e.monthlyCashLimit,
      budgetState: forecastCash > e.monthlyCashLimit ? 'EXCEEDS_ASSUMED_CASH_LIMIT' : 'WITHIN_ASSUMED_CASH_LIMIT',
    },
    observed: input.observations.length === 0 ? null : {
      window: input.observationWindow, attempts: input.observations.length, accepted: accepted.length,
      notAccepted: input.observations.length - accepted.length, cash, humanMinutes, totalWithTime: total,
      cashPerAccepted: accepted.length > 0 ? cash / accepted.length : null,
      totalPerAccepted: accepted.length > 0 ? total / accepted.length : null,
      netMinutesSaved: savedMinutes,
      netTimeValueAfterCash: savedMinutes === null ? null : savedMinutes * e.hourlyTimeValue / 60 - cash,
    },
  };
}

const md = value => String(value).replace(/[\r\n]+/gu, ' ').replace(/\\/gu, '\\\\').replace(/[\[\]`*_{}#<>|]/gu, '\\$&');
const amount = (value, currency) => value === null ? 'Unknown' : `${value.toFixed(3)} ${currency}`;
const decimal = value => value === null ? 'Unknown' : value.toFixed(2);

export function renderMarkdown(input, result, fingerprints = {}) {
  const f = result.forecast;
  const lines = [
    `# ${md(input.title)}`, '', `Evidence state: **${result.evidenceState}**`, '',
    'This packet reports an authored plan and imported declarations. It does not verify a runtime, enforce permissions or approve release.', '',
    `Buyer: ${md(input.buyer)}`, '', `Job: ${md(input.userJob)}`, '', `Activation: ${md(input.activation)}`, '',
    '## Constraints', '', ...input.constraints.map(value => `- ${md(value)}`), '',
    '## Decision and alternatives', '',
    '| Option | Choice | Advantage | Tradeoff |', '| --- | --- | --- | --- |',
    ...input.options.map(option => `| ${md(option.name)} | ${option.id === input.chosenOption ? 'Selected for trial' : 'Alternative'} | ${md(option.advantage)} | ${md(option.tradeoff)} |`), '',
    '## Trust boundaries to implement and test', '',
    '| Boundary | Reads | Writes | Approval |', '| --- | --- | --- | --- |',
    ...input.trustBoundaries.map(row => `| ${md(row.name)} | ${md(row.reads)} | ${md(row.writes)} | ${md(row.approval)} |`), '',
    '## Runtime failure tests still to execute', '',
    '| ID | Trigger | Required result | Recovery |', '| --- | --- | --- | --- |',
    ...input.failureTests.map(row => `| ${md(row.id)} | ${md(row.trigger)} | ${md(row.expected)} | ${md(row.recovery)} |`), '',
    '## Monthly forecast from assumptions', '',
    'Rates, acceptance, volume and time value are input assumptions. Include retries in attempts. Check current rates and caps before using a provider.', '',
    '| Metric | Assumed result |', '| --- | --- |',
    `| Attempts / expected accepted | ${f.attempts} / ${decimal(f.accepted)} |`,
    `| Cash cost | ${amount(f.cash, result.currency)} |`,
    `| Human minutes | ${decimal(f.humanMinutes)} |`,
    `| Cash plus valued time | ${amount(f.totalWithTime, result.currency)} |`,
    `| Cash per expected accepted result | ${amount(f.cashPerAccepted, result.currency)} |`,
    `| Total per expected accepted result | ${amount(f.totalPerAccepted, result.currency)} |`,
    `| Cash limit / comparison | ${amount(f.monthlyCashLimit, result.currency)} / ${f.budgetState} |`, '',
    '## Imported observations', '',
  ];
  const o = result.observed;
  if (o === null) lines.push('No observations supplied. Actual cost, activation, time saved and ROI remain unknown.', '');
  else lines.push(
    `Window: ${md(o.window)}. Coverage and acceptance are unverified user declarations.`, '',
    '| Metric | Declared result |', '| --- | --- |',
    `| All attempts / accepted / not accepted | ${o.attempts} / ${o.accepted} / ${o.notAccepted} |`,
    `| Cash cost, all attempts | ${amount(o.cash, result.currency)} |`,
    `| Human minutes, all attempts | ${decimal(o.humanMinutes)} |`,
    `| Cash per accepted result | ${amount(o.cashPerAccepted, result.currency)} |`,
    `| Cash plus valued time per accepted result | ${amount(o.totalPerAccepted, result.currency)} |`,
    `| Net minutes saved against declared baseline | ${decimal(o.netMinutesSaved)} |`,
    `| Net time value after cash | ${amount(o.netTimeValueAfterCash, result.currency)} |`, '',
    'Time value uses the assumed hourly rate. It is not collected revenue or cash profit. Missing accepted baselines leave time savings unknown.', '',
    '| Attempt | Outcome | Evidence reference to inspect |', '| --- | --- | --- |',
    ...input.observations.map(row => `| ${md(row.attemptId)} | ${row.outcome} | ${md(row.evidenceRef)} |`), '',
  );
  lines.push('## Export and rollback', '', md(input.export), '', md(input.rollback), '',
    '## Reusable community contribution', '', md(input.communityContribution), '',
    '## Stop rule', '', md(input.stopRule), '',
    '## Next review', '',
    'A distinct reviewer must inspect the implementation, evidence references, costs and actual user result. Planned failure tests are not executed tests. Commercial readiness remains a separate product release decision.', '');
  if (fingerprints.inputSha256 && fingerprints.toolSha256) lines.push('## Reproduction', '',
    `Input SHA-256: ${fingerprints.inputSha256}`, '', `Tool SHA-256: ${fingerprints.toolSha256}`, '');
  return lines.join('\n');
}

function readInput(path) {
  let fd;
  try {
    fd = openSync(path, constants.O_RDONLY | (constants.O_NONBLOCK ?? 0));
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.size > MAX_BYTES) throw new Error();
    const bytes = Buffer.alloc(MAX_BYTES + 1);
    let length = 0;
    while (length <= MAX_BYTES) {
      const count = readSync(fd, bytes, length, bytes.length - length, null);
      if (count === 0) break;
      length += count;
    }
    if (length > MAX_BYTES) throw new Error();
    return bytes.subarray(0, length);
  } catch { throw new Error('Input must be a readable regular JSON file no larger than 1 MiB.'); }
  finally { if (fd !== undefined) closeSync(fd); }
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 1 || args.length > 2 || (args.length === 2 && args[1] !== '--json') || args[0].startsWith('--')) {
    throw new Error('Usage: node scripts/architecture-review.mjs decision.json [--json]');
  }
  const bytes = readInput(args[0]);
  let input;
  try { input = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new Error('Input must contain valid UTF-8 JSON.'); }
  const result = analyzeDecision(input);
  const fingerprints = { inputSha256: sha256(bytes), toolSha256: sha256(readFileSync(fileURLToPath(import.meta.url))) };
  process.stdout.write(args[1] === '--json' ? `${JSON.stringify({ ...result, ...fingerprints }, null, 2)}\n` : renderMarkdown(input, result, fingerprints));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { main(); } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
