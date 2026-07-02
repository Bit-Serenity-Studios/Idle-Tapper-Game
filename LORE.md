# LORE

Every piece of user-facing prose in the game, compiled. The single voice is **dark academia, restrained, faintly ominous** — nothing modern, no slang, no pop-culture nod. Edit-in-place:

- **UI copy** — [`src/content/lore.ts`](./src/content/lore.ts)
- **Generators** — [`src/content/generators.ts`](./src/content/generators.ts)
- **Upgrades** — [`src/content/upgrades.ts`](./src/content/upgrades.ts)
- **Transmutations** — [`src/content/transmutations.ts`](./src/content/transmutations.ts)

---

## The apparatus (generators)

**Copper Alembic** — *It drips. Slowly. But it drips.*

**Apprentice** — *A nervous student who asks no questions.*

**Athanor** — *The alchemist's furnace. It is never allowed to cool.*

**Ritual Circle** — *Chalk, salt, and things best not named.*

**Bound Homunculus** — *It works tirelessly. You avoid its eyes.*

**Occult Library** — *The books read themselves now.*

**Lunar Observatory** — *You have learned to distil moonlight itself.*

**The Inner Sanctum** — *You no longer remember building this room.*

---

## Apparatus upgrades

**Silvered Retort** — *A finer condensate. Copper Alembics distil three times as much.*

**Philosophic Mercury** — *The volatile spirit, ennobled. Copper Alembics distil twice again.*

**Iron Discipline** — *They no longer flinch at what they must handle. Apprentices work thrice as fast.*

**Oath of Silence** — *What they saw last winter, they will not speak of. Twice more Essence, then.*

**Salamander Stone** — *A fire that answers to the fire. Athanors burn thrice as hot.*

**Red Chalk** — *The lines bind harder in blood. Ritual Circles yield thrice.*

**Unblinking Eyes** — *It has stopped sleeping. This is thought to be good for Essence.*

**The Index Prohibitum** — *A catalogue of every forbidden text. They collate themselves at night.*

**Silver Astrolabe** — *The moon consents to be measured, and thereby to be distilled.*

**Unnamed Geometry** — *A shape with more corners than the eye admits. The Sanctum labours thrice as hard.*

---

## Forbidden Knowledge (global upgrades)

**The Hand That Pours** — *Your grip has grown steadier than it should be. Each Distill yields five.*

**The Practised Hand** — *Repetition begets a certain grace. Each Distill yields five times over.*

**The Emerald Tablet, Deciphered** — *As above, so below — you have finally understood the middle line. All production doubles.*

**Azoth** — *The universal solvent, and its worthy opposite. All production doubles again.*

**The Great Signature** — *A single character, deep in an old margin, changes everything. Production trebles.*

**Perpetual Flame** — *The candles no longer gutter. The apparatus works while you sleep — for as long as you sleep, to a point.*

**The Long Vigil** — *The night watches back. Offline production is not diminished.*

---

## Transmutations (the prestige tree)

**Shard of Nigredo** — *A black grain kept in a phial around your neck. All production is doubled.*

**Shard of Albedo** — *A pale grain, warm to the touch. Each Distill is trebled.*

**Shard of Citrinitas** — *A grain like a fleck of hard sun. All costs are cheaper.*

**Shard of Rubedo** — *A red grain that will not stay in the light. Production doubles once more.*

**Inheritance** — *Each new beginning is not quite from nothing.*

**Greater Inheritance** — *The apparatus, curiously, is already warm.*

**The Widow's Stone** — *Some who complete the Work end alone. Prima Materia yield increases by half.*

---

## The Great Work (prestige)

> *To complete a stage of the Work is to burn away what has been built and be paid, in the coin of the world beneath, for what remained. Nothing endures but the Prima Materia — and what you have inscribed with it.*

The four base stages cycle: **Nigredo → Albedo → Citrinitas → Rubedo**. After a full turn, roman numerals suffix each: *Nigredo II*, *Albedo II*, and so on.

The confirm modal never uses the word "prestige" — it says only **Complete the Work?** and **Yes — complete the Work**.

---

## The Long Vigil (offline)

> *While you kept the long vigil these [duration], the athanor burned on. [N] Essence has been distilled.*

When the offline cap is reached and there was more time to credit:

> *The vessel would take no more. [duration] of your vigil went uncredited.*

The offer to watch a rewarded ad reads **Consult the Spirits** — *Sacrifice a vision to double what was distilled.*

---

## The visions (timed boosts)

**Blood Moon** — *For four minutes, the study distils twice as fast.*

**Time Dilation Ritual** — *A single hour of the Work, compressed into the present moment.*

Both are surfaced as **Consult the Spirits (watch a vision)** — the ad prompt is diegetic.

---

## Commissions (daily challenge)

> *A letter arrived under the door, with no seal. You are asked to distil a certain measure by dawn.*

When missed: *The candle guttered. The patron has departed.*

---

## Lunar Phases (login streak)

Displayed by the current phase for the day-in-streak: new, waxing crescent, first quarter, waxing gibbous, full, waning gibbous, last quarter. On the seventh day, one Prima Materia. The button reads **Attend the moon**; if already attended today: *You have attended the moon already tonight.*

---

## The Patron's Pact (IAP)

> *A patron of a certain kind will remove the interstitial visions from your practice, and shorten the cooldown of the spirits you consult.*

Signed: *Signed. The interstitials are stilled.*

---

## Settings

- **Seal the Sigil** — export save
- **Break the Sigil** — import save
- **Cast the Grimoire into the fire** — wipe save
  - *This will burn every page. There is no cinder from which to remake it. Are you certain?*
- **Tremor of the hand** — haptics toggle
- **Sound of the flame** — audio toggle

## The empty study

> *No apparatus stands. The shelves are dark. The hand must do the work of many, for now.*
