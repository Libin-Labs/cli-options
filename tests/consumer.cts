import { parseCliOptions, type OptionSpec } from '@lp-labs/cli-options';
const spec: OptionSpec = { type: 'string', repeat: true };
const result = parseCliOptions([], { label: spec });
// @ts-expect-error option types are explicit.
const invalid: OptionSpec = { type: 'bool' };
void [result, invalid];
