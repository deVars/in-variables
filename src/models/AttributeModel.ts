/**
 * Model constructs for component oninit helper
 * @param initialValue
 */

export interface StrictAttributeModel<Base> {
  readonly value: Base;
  set: StrictSetter<Base>;
}

export interface AttributeModel<Base> {
  readonly value: Base | null;
  set: StrictSetter<Base | null>;
}

export function getAttributeModel<Base>(
  initialValue: Base | null,
): AttributeModel<Base> {
  let current = initialValue;
  return {
    get value() { return current; },
    set: setter,
  };
  function setter(newValue: Base | null): Base | null {
    current = newValue;
    return current;
  }
}

export function getStrictAttributeModel<Base>(
  initialValue: Base,
): StrictAttributeModel<Base> {
  let current = initialValue;
  return {
    get value() { return current; },
    set: setter,
  };
  function setter(newValue: Base): Base {
    current = newValue;
    return current;
  }
}

interface StrictSetter<Base> {
  (newValue: Base): Base;
}
