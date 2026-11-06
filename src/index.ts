export type OptionSpec =
  | {
      readonly type: 'boolean';
      readonly short?: string;
      readonly default?: boolean;
      readonly repeat?: boolean;
    }
  | {
      readonly type: 'string';
      readonly short?: string;
      readonly default?: string;
      readonly repeat?: boolean;
    }
  | {
      readonly type: 'number';
      readonly short?: string;
      readonly default?: number;
      readonly repeat?: boolean;
    };
export type OptionSchema = Readonly<Record<string, OptionSpec>>;
export interface ParseOptionsResult {
  readonly values: Readonly<
    Record<string, boolean | string | number | readonly (string | number | boolean)[]>
  >;
  readonly positional: readonly string[];
}
export function parseCliOptions(args: readonly string[], schema: OptionSchema): ParseOptionsResult {
  const shorts = new Map<string, string>();
  for (const [name, spec] of Object.entries(schema)) {
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(name)) throw new TypeError(`Invalid option name: ${name}`);
    if (spec.short) {
      if (!/^[A-Za-z]$/.test(spec.short) || shorts.has(spec.short))
        throw new TypeError(`Invalid or duplicate short option: ${spec.short}`);
      shorts.set(spec.short, name);
    }
  }
  const values: Record<string, boolean | string | number | (string | number | boolean)[]> = {};
  for (const [name, spec] of Object.entries(schema)) {
    if (spec.default !== undefined) values[name] = spec.repeat ? [spec.default] : spec.default;
    else if (spec.type === 'boolean' && !spec.repeat) values[name] = false;
    else if (spec.repeat) values[name] = [];
  }
  const assigned = new Set<string>();
  const assign = (name: string, raw?: string): void => {
    const spec = schema[name]!;
    let value: string | number | boolean;
    if (spec.type === 'boolean') {
      if (raw !== undefined) throw new TypeError(`Boolean option --${name} does not take a value`);
      value = true;
    } else {
      if (raw === undefined || raw === '') throw new TypeError(`Option --${name} requires a value`);
      if (spec.type === 'string') value = raw;
      else {
        value = Number(raw);
        if (!Number.isFinite(value))
          throw new TypeError(`Option --${name} requires a finite number`);
      }
    }
    const prior = values[name];
    if (spec.repeat) values[name] = [...(Array.isArray(prior) ? prior : []), value];
    else {
      if (assigned.has(name)) throw new TypeError(`Option --${name} was specified more than once`);
      values[name] = value;
      assigned.add(name);
    }
  };
  const positional: string[] = [];
  let endOptions = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (endOptions) positional.push(arg);
    else if (arg === '--') endOptions = true;
    else if (arg.startsWith('--')) {
      const equals = arg.indexOf('=');
      const name = arg.slice(2, equals < 0 ? undefined : equals);
      if (!Object.hasOwn(schema, name)) throw new TypeError(`Unknown option: --${name}`);
      const spec = schema[name]!;
      let raw = equals < 0 ? undefined : arg.slice(equals + 1);
      if (spec.type !== 'boolean' && raw === undefined) raw = args[++i];
      assign(name, raw);
    } else if (arg.startsWith('-') && arg !== '-') {
      const flags = arg.slice(1);
      for (let at = 0; at < flags.length; at++) {
        const name = shorts.get(flags[at]!);
        if (!name) throw new TypeError(`Unknown short option: -${flags[at]}`);
        const spec = schema[name]!;
        let raw: string | undefined;
        if (spec.type !== 'boolean') {
          raw = flags.slice(at + 1) || args[++i];
          at = flags.length;
        }
        assign(name, raw);
      }
    } else positional.push(arg);
  }
  return Object.freeze({ values: Object.freeze(values), positional: Object.freeze(positional) });
}
