# @lp-labs/cli-options

Typed command-line option parsing from an explicit schema and argument array. It does not read
`process.argv`, environment variables, or global process state.

## Install and use

```bash
npm install @lp-labs/cli-options
```

```js
import { parseCliOptions } from '@lp-labs/cli-options';

const result = parseCliOptions(['-v', '--output=report.json', '--limit', '10', 'input.csv'], {
  verbose: { type: 'boolean', short: 'v' },
  output: { type: 'string', short: 'o', default: 'out.txt' },
  limit: { type: 'number', default: 100 },
});
if (result.values.limit !== 10 || result.positional[0] !== 'input.csv')
  throw new Error('CLI parse failed');
```

Node.js 18+ ESM and CommonJS consumers receive declarations. Runtime/peer dependency count is zero.

## API and syntax

`parseCliOptions(args, schema): ParseOptionsResult` returns frozen `values` and `positional` arrays.
An `OptionSchema` maps long names to `OptionSpec` discriminated by `type: 'boolean' | 'string' |
'number'`. An optional one-letter `short`, `default`, and `repeat` flag can be specified. Repeated
options produce an array in encounter order; non-repeated duplicate occurrences are errors.

Supports `--long`, `--long=value`, `-x`, combined boolean shorts (for example `-abc`), and an attached
short value (for example `-oresult`). The first `--` ends option parsing. Negative numbers can be
passed as attached long values (`--limit=-2`) to avoid being interpreted as another short option.
Boolean flags are false when absent and true when present; `--flag=false` is not accepted.

## Errors and customization

Unknown options, duplicate shorts, malformed schemas, missing values, invalid numeric values, and
duplicate non-repeat options throw `TypeError`. Numbers must be finite JavaScript numbers. The schema
is validated before parsing. Supply defaults and aliases explicitly in the schema; there is no
implicit negated-boolean syntax or abbreviation matching.

## Performance and scope

Parsing is O(number of arguments + schema entries), excluding the small map initialization. No
environment-variable expansion, subcommand handling, help generation, or process exit behavior is
included. The caller owns argument array limits and process integration.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
