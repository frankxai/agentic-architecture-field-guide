import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { analyzeDecision, renderMarkdown, validateDecision } from './architecture-review.mjs';

const tool = fileURLToPath(new URL('./architecture-review.mjs', import.meta.url));
const fixture = fileURLToPath(new URL('../examples/consultant-brief/decision.json', import.meta.url));
const sample = () => JSON.parse(readFileSync(fixture, 'utf8'));
const observed = () => {
  const input = sample();
  input.evidenceMode = 'illustrative';
  input.observationWindow = 'Synthetic three-attempt fixture, not a customer result';
  input.observations = [
    { attemptId: 'a1', outcome: 'accepted', modelCash: 1, infrastructureCash: 1, humanMinutes: 5, baselineMinutes: 30, evidenceRef: 'Synthetic acceptance fixture A' },
    { attemptId: 'f1', outcome: 'failed', modelCash: 4, infrastructureCash: 0, humanMinutes: 10, baselineMinutes: null, evidenceRef: 'Synthetic failure fixture' },
    { attemptId: 'a2', outcome: 'accepted', modelCash: 1, infrastructureCash: 2, humanMinutes: 5, baselineMinutes: 40, evidenceRef: 'Synthetic acceptance fixture B' },
  ];
  return input;
};

test('the worked example gives a forecast, never an observed result', () => {
  const input = sample();
  const result = analyzeDecision(input);
  assert.equal(result.evidenceState, 'FORECAST_ONLY');
  assert.equal(result.observed, null);
  assert.equal(result.forecast.cash, 24);
  assert.equal(result.forecast.humanMinutes, 600);
  assert.equal(result.forecast.totalWithTime, 624);
  assert.equal(result.forecast.accepted, 75);
  assert.equal(result.forecast.cashPerAccepted, 0.32);
  assert.equal(result.forecast.totalPerAccepted, 8.32);
  assert.match(renderMarkdown(input, result), /Actual cost, activation, time saved and ROI remain unknown/);
});

test('cost and time denominators retain failed attempts', () => {
  const result = analyzeDecision(observed());
  assert.equal(result.evidenceState, 'ILLUSTRATIVE_OBSERVATIONS');
  assert.deepEqual(result.observed, {
    window: 'Synthetic three-attempt fixture, not a customer result', attempts: 3, accepted: 2, notAccepted: 1,
    cash: 9, humanMinutes: 20, totalWithTime: 29,
    cashPerAccepted: 4.5, totalPerAccepted: 14.5,
    netMinutesSaved: 50, netTimeValueAfterCash: 41,
  });
});

test('rejected work and retries count like failed work', () => {
  const input = observed();
  input.observations[1].outcome = 'rejected';
  input.observations.push({ ...input.observations[1], attemptId: 'retry-1' });
  const o = analyzeDecision(input).observed;
  assert.equal(o.attempts, 4);
  assert.equal(o.notAccepted, 2);
  assert.equal(o.cash, 13);
  assert.equal(o.humanMinutes, 30);
  assert.equal(o.totalPerAccepted, 21.5);
});

test('all failed attempts leave accepted unit cost and time savings unknown', () => {
  const input = observed();
  input.observations.forEach(row => { row.outcome = 'failed'; row.baselineMinutes = null; });
  const result = analyzeDecision(input);
  assert.equal(result.observed.cashPerAccepted, null);
  assert.equal(result.observed.totalPerAccepted, null);
  assert.equal(result.observed.netMinutesSaved, null);
  assert.equal(result.observed.netTimeValueAfterCash, null);
  assert.equal(result.observed.cash, 9);
  assert.match(renderMarkdown(input, result), /Cash per accepted result \| Unknown/);
});

test('one unknown accepted baseline makes total time savings unknown', () => {
  const input = observed();
  input.observations[0].baselineMinutes = null;
  const o = analyzeDecision(input).observed;
  assert.equal(o.totalPerAccepted, 14.5);
  assert.equal(o.netMinutesSaved, null);
});

test('negative time savings remain visible instead of being clamped', () => {
  const input = observed();
  input.observations[0].baselineMinutes = 1;
  input.observations[2].baselineMinutes = 2;
  assert.equal(analyzeDecision(input).observed.netMinutesSaved, -17);
  assert.equal(analyzeDecision(input).observed.netTimeValueAfterCash, -26);
});

test('declared rows cannot grant verified or live status', () => {
  const input = observed();
  input.evidenceMode = 'declared';
  const result = analyzeDecision(input);
  assert.equal(result.evidenceState, 'DECLARED_OBSERVATIONS_NOT_VERIFIED');
  assert.match(renderMarkdown(input, result), /Coverage and acceptance are unverified user declarations/);
  input.evidenceMode = 'verified';
  assert.throws(() => analyzeDecision(input), /Invalid field: evidenceMode/);
});

test('zero forecast acceptance or attempts keeps expected unit cost unknown', () => {
  for (const key of ['expectedAcceptanceRate', 'monthlyAttempts']) {
    const input = sample();
    input.economics[key] = 0;
    const result = analyzeDecision(input);
    assert.equal(result.forecast.cashPerAccepted, null);
    assert.equal(result.forecast.totalPerAccepted, null);
    assert.ok(Number.isFinite(result.forecast.totalWithTime));
  }
});

test('cash limit equality passes the comparison and a lower cap is flagged', () => {
  const input = sample();
  input.economics.monthlyCashLimit = 24;
  assert.equal(analyzeDecision(input).forecast.budgetState, 'WITHIN_ASSUMED_CASH_LIMIT');
  input.economics.monthlyCashLimit = 23.99;
  assert.equal(analyzeDecision(input).forecast.budgetState, 'EXCEEDS_ASSUMED_CASH_LIMIT');
});

test('unrepresentable forecast ratios fail instead of serializing infinity as null', () => {
  const input = sample();
  input.economics.expectedAcceptanceRate = Number.MIN_VALUE;
  assert.throws(() => analyzeDecision(input), /economics.expectedAcceptanceRate/);
});

test('unknown root keys are rejected without printing values', () => {
  const input = sample();
  input.secret = 'DO_NOT_PRINT_TEST_VALUE';
  assert.throws(() => validateDecision(input), error => error.message === 'Invalid field: decision');
});

test('missing selected option, duplicate option and missing tradeoff are rejected', () => {
  for (const mutate of [
    input => { input.chosenOption = 'absent'; },
    input => { input.options[1].id = input.options[0].id; },
    input => { input.options[1].tradeoff = ''; },
    input => { input.options = [input.options[0]]; },
  ]) {
    const input = sample(); mutate(input);
    assert.throws(() => validateDecision(input), /Invalid field:/);
  }
});

test('unknown, missing and malformed trust or failure records are rejected', () => {
  for (const mutate of [
    input => { input.trustBoundaries = []; },
    input => { delete input.trustBoundaries[0].approval; },
    input => { input.failureTests[0].command = 'DO_NOT_EXECUTE'; },
    input => { input.failureTests[1].id = input.failureTests[0].id; },
    input => { input.rollback = '\u0000'; },
  ]) {
    const input = sample(); mutate(input);
    assert.throws(() => validateDecision(input), /Invalid field:/);
  }
});

test('negative, non-finite, excessive and fractional token/count inputs are rejected', () => {
  for (const [key, value] of [
    ['monthlyAttempts', -1], ['monthlyAttempts', 1.5], ['inputTokensPerAttempt', 1.5],
    ['outputRatePerMillion', Infinity], ['hourlyTimeValue', NaN], ['expectedAcceptanceRate', 1.01],
    ['fixedMonthlyCash', 1_000_001], ['inputRatePerMillion', '2'],
  ]) {
    const input = sample(); input.economics[key] = value;
    assert.throws(() => validateDecision(input), /Invalid field: economics/);
  }
});

test('unrecognized currency fails rather than pretending to convert it', () => {
  const input = sample(); input.economics.currency = 'BTC';
  assert.throws(() => validateDecision(input), /economics.currency/);
});

test('observations require evidence, unique attempts and an explicit window/mode', () => {
  for (const mutate of [
    input => { input.observations[0].evidenceRef = ''; },
    input => { input.observations[1].attemptId = input.observations[0].attemptId; },
    input => { input.observations[0].humanMinutes = -1; },
    input => { input.observations[0].outcome = 'live'; },
    input => { input.observationWindow = null; },
    input => { input.evidenceMode = 'none'; },
    input => { input.observations[0].baselineMinutes = 'unknown'; },
  ]) {
    const input = observed(); mutate(input);
    assert.throws(() => validateDecision(input), /Invalid field:/);
  }
  const empty = sample(); empty.evidenceMode = 'declared';
  assert.throws(() => validateDecision(empty), /evidenceMode/);
});

test('Markdown payloads cannot inject table columns, raw HTML, headings or images', () => {
  const input = observed();
  input.title = '<script>alert(1)</script>\n# spoof';
  input.options[0].name = 'bad | injected';
  input.observations[0].evidenceRef = '![image](https://example.invalid/x)\n| fake |';
  const report = renderMarkdown(input, analyzeDecision(input));
  assert.ok(!report.includes('<script>'));
  assert.ok(!report.includes('\n# spoof'));
  assert.ok(!report.includes('![image]'));
  assert.ok(report.includes('bad \\| injected'));
  assert.ok(report.includes('!\\[image\\]'));
});

test('rendering and analysis are deterministic and leave the input unchanged', () => {
  const input = observed(); const before = JSON.stringify(input);
  const first = renderMarkdown(input, analyzeDecision(input));
  assert.equal(first, renderMarkdown(input, analyzeDecision(input)));
  assert.equal(JSON.stringify(input), before);
});

test('CLI JSON carries exact input and tool fingerprints without writing a file', () => {
  const run = spawnSync(process.execPath, [tool, fixture, '--json'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert.equal(run.stderr, '');
  const output = JSON.parse(run.stdout);
  assert.equal(output.evidenceState, 'FORECAST_ONLY');
  assert.equal(output.inputSha256, createHash('sha256').update(readFileSync(fixture)).digest('hex'));
  assert.equal(output.toolSha256, createHash('sha256').update(readFileSync(tool)).digest('hex'));
});

test('CLI malformed JSON, invalid UTF-8, missing file, directory and oversized file fail privately', () => {
  const dir = mkdtempSync(join(tmpdir(), 'architecture-review-'));
  try {
    const malformed = join(dir, 'bad.json'); writeFileSync(malformed, '{"private":"DO_NOT_PRINT_TEST_VALUE"');
    const utf8 = join(dir, 'utf8.json'); writeFileSync(utf8, Buffer.from([0xff]));
    const large = join(dir, 'large.json'); writeFileSync(large, Buffer.alloc(1024 * 1024 + 1, 32));
    for (const path of [malformed, utf8, large, dir, join(dir, 'absent.json')]) {
      const run = spawnSync(process.execPath, [tool, path], { encoding: 'utf8', timeout: 5000 });
      assert.equal(run.status, 1);
      assert.equal(run.stdout, '');
      assert.ok(!run.stderr.includes('DO_NOT_PRINT_TEST_VALUE'));
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('CLI rejects unsupported flags rather than running an input command', () => {
  const run = spawnSync(process.execPath, [tool, fixture, '--execute'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.equal(run.stdout, '');
  assert.match(run.stderr, /^Usage:/);
});
