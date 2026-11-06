import { parseCliOptions, type OptionSchema, type ParseOptionsResult } from '@lp-labs/cli-options';
const schema: OptionSchema = {
  dryRun: { type: 'boolean', short: 'd' },
  count: { type: 'number', default: 2 },
};
const parsed: ParseOptionsResult = parseCliOptions(['-d'], schema);
// @ts-expect-error invalid option kind.
const bad: OptionSchema = { name: { type: 'integer' } };
void [parsed, bad];
