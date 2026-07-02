import {
  serialize,
  deserialize,
  migrate,
  exportSave,
  importSave,
  newLiveState,
  CURRENT_SAVE_VERSION,
} from '../src/engine/save';
import { fromNumber, cmp, toNumber } from '../src/engine/bigNumber';

describe('save', () => {
  test('serialize/deserialize round-trips', () => {
    const s = newLiveState(1000);
    s.essence = fromNumber(1234567);
    s.lifetimeEssence = fromNumber(9876543210);
    s.generatorsOwned.copper_alembic = 10;
    s.ownedUpgrades.the_hand_that_pours = true;
    s.primaMateria = 5;
    s.prestigeCount = 2;
    s.loginStreak = 3;

    const saved = serialize(s);
    expect(saved.version).toBe(CURRENT_SAVE_VERSION);
    const back = deserialize(saved);
    expect(cmp(back.essence, s.essence)).toBe(0);
    expect(cmp(back.lifetimeEssence, s.lifetimeEssence)).toBe(0);
    expect(back.generatorsOwned.copper_alembic).toBe(10);
    expect(back.ownedUpgrades.the_hand_that_pours).toBe(true);
    expect(back.primaMateria).toBe(5);
    expect(back.prestigeCount).toBe(2);
    expect(back.loginStreak).toBe(3);
  });

  test('migrate from a pre-versioned save fills defaults', () => {
    const legacy = {
      essence: '1.234e6',
      lifetimeEssence: '5e7',
      generatorsOwned: { copper_alembic: 3 },
      ownedUpgrades: {},
      lastSaveMs: 1000,
      createdAtMs: 500,
    };
    const migrated = migrate(legacy);
    expect(migrated).not.toBeNull();
    expect(migrated!.version).toBe(CURRENT_SAVE_VERSION);
    const live = deserialize(migrated!);
    expect(toNumber(live.essence)).toBeCloseTo(1.234e6, 0);
    expect(live.primaMateria).toBe(0);
    expect(live.ownedTransmutations).toEqual({});
    expect(live.removeAdsPurchased).toBe(false);
  });

  test('migrate rejects garbage', () => {
    expect(migrate(null)).toBeNull();
    expect(migrate('a string')).toBeNull();
    expect(migrate(42)).toBeNull();
  });

  test('export/import round-trip via base64', () => {
    const s = newLiveState(2000);
    s.essence = fromNumber(1e42);
    s.primaMateria = 17;
    const encoded = exportSave(s);
    expect(encoded.startsWith('MOP1:')).toBe(true);
    const decoded = importSave(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.primaMateria).toBe(17);
    expect(cmp(deserialize(decoded!).essence, s.essence)).toBe(0);
  });

  test('import rejects wrong tag', () => {
    expect(importSave('NOPE1:whatever')).toBeNull();
    expect(importSave('total garbage')).toBeNull();
  });
});
