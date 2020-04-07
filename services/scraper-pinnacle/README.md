# API responses

## Leagues for a sport

`/sports/${SPORT_ID}/leagues?all=false`

League info will come in all matchup responses, so no need to store any of this. We just use it to get the `id` and fetch the matchups.

```json
[
  {
    "ageLimit": -2,
    "external": {},
    "featureOrder": -1,
    "group": "South Korea",
    "id": 192553,
    "isFeatured": false,
    "isHidden": false,
    "isPromoted": false,
    "isSticky": false,
    "matchupCount": 11,
    "name": "League of Legends - Champions Korea",
    "sport": {
      "featureOrder": 0,
      "id": 12,
      "isFeatured": true,
      "isHidden": false,
      "isSticky": false,
      "matchupCount": 120,
      "name": "E Sports",
      "primaryMarketType": "moneyline"
    }
  }
]
```

## Matchups for a league

`/leagues/${LEAGUE_ID}/matchups`

Can return both Regular matchups and Special matchups in the same array.

**`type === "matchup" && units === "Regular"`**

```json
[
```

```json
  {
    "ageLimit": -2,
    "altTeaser": false,
    "external": {},
    "hasLive": true,
    "hasMarkets": true,
    "id": 1117209721,
    "isHighlighted": false,
    "isLive": false,
    "isPromoted": false,
    "league": { /* entire league goes here */ },
    "liveMode": null,
    "parent": null,
    "parentId": null,
    "parlayRestriction": "unique_matchups",
    "participants": [
      {
        "alignment": "home",
        "name": "SANDBOX Gaming",       |
        "order": 0
      },
      {
        "alignment": "away",
        "name": "Hanwha Life Esports",
        "order": 1
      }
    ],
    "periods": [ /* not relevant now */ ],
    "rotation": 39379,
    "startTime": "2020-04-04T09:00:00Z",
    "state": {},
    "status": "pending",
    "totalMarketCount": 83,
    "type": "matchup",
    "units": "Regular",
    "version": 265269144
  },
```

**`type === "matchup" && units !== "Regular"`**

It has:

- `parentId` that matches the regular matchup `id` above.
- a `parent` property that has all the correct data from the matchup.
  - participants must be retrieved from the `parent.participants` property.
- `units` must be taken into consideration, because the market don't have direct information on it, only through their `matchupId`

```json
  {
    ...
    "id": 1117213287,
    ...
    "parent": {
      "id": 1117209721,
      "participants": [
        {
          "alignment": "home",
          "name": "SANDBOX Gaming",
          "score": null
        },
        {
          "alignment": "away",
          "name": "Hanwha Life Esports",
          "score": null
        }
      ],
      "startTime": "2020-04-04T09:00:00+00:00"
    },
    "parentId": 1117209721,
    ...
    "participants": [
      {
        "alignment": "home",
        "name": "SANDBOX Gaming (Kills)",
        "order": 0
      },
      {
        "alignment": "away",
        "name": "Hanwha Life Esports (Kills)",
        "order": 1
      }
    ],
    ...
    "type": "matchup",
    "units": "Kills",
    ...
  },
```

**`type === "special"`**

It has:

- `units` as `null`
- a `parentId` that matches the regular matchup `id` above.
- a `parent` property that has all the correct data from the matchup.
  - participants must be retrieved from the `parent.participants` property.
- the description for the market can be found in the `special.description` property.
- the root `participants` property have `id`s which are used in moneyline markets

```json
  {
    "ageLimit": -2,
    "altTeaser": false,
    "external": {},
    "hasLive": true,
    "hasMarkets": true,
    "id": 1117212490,
    "isHighlighted": false,
    "isLive": false,
    "isPromoted": false,
    "league": { /* entire league goes here */ },
    "liveMode": null,
    "parent": {
      "id": 1117209721,
      "participants": [
        {
          "alignment": "home",
          "name": "SANDBOX Gaming",
          "score": null
        },
        {
          "alignment": "away",
          "name": "Hanwha Life Esports",
          "score": null
        }
      ],
      "startTime": "2020-04-04T09:00:00+00:00"
    },
    "parentId": 1117209721,
    "parlayRestriction": null,
    "participants": [
      {
        "alignment": "neutral",
        "id": 1117212491,
        "name": "Odd",
        "order": 0,
        "rotation": 39379
      },
      {
        "alignment": "neutral",
        "id": 1117212492,
        "name": "Even",
        "order": 0,
        "rotation": 39380
      }
    ],
    "periods": [ /* not relevant now */ ],
    "rotation": 39379,
    "special": {
      "category": "Teams",
      "description": "(Map 2) Total kills Odd/Even"
    },
    "startTime": "2020-04-04T09:00:00Z",
    "state": {},
    "status": "pending",
    "totalMarketCount": 83,
    "type": "special",
    "units": null,
    "version": 44447402
  },
```

```json
]
```

## Markets for a match

`/matchups/${MATCH_ID}/markets/related/straight`

This brings markets for the match with `id = MATCH_ID` and for all matches that has `parentId = MATCH_ID`.

Markets always have a `matchupId`, which can map to a matchup `id`.
Remember that matchups can have a parent, which holds the most accurate information about it.

All the examples below belong to the same parent matchup. You can verify that by mapping their `matchupId`s properties to the matchups `id` properties above and to their parents.

```json
[
```

**Moneyline**

```json
  {
    "cutoffAt": "2020-04-05T06:00:00+00:00",
    "isAlternate": false,
    "key": "s;1;m",
    "limits": [
      {
        "amount": 250,
        "type": "maxRiskStake"
      }
    ],
    "matchupId": 1117209721,
    "period": 1,
    "prices": [
      {
        "designation": "home",
        "price": -117
      },
      {
        "designation": "away",
        "price": -104
      }
    ],
    "status": "open",
    "type": "moneyline",
    "version": 988220427
  },
```

**Handicap**

```json
  {
    "cutoffAt": "2020-04-05T06:00:00+00:00",
    "isAlternate": false,
    "key": "s;0;s;-1.5",
    "limits": [
      {
        "amount": 250,
        "type": "maxRiskStake"
      }
    ],
    "matchupId": 1117209721,
    "period": 0,
    "prices": [
      {
        "designation": "home",
        "points": -1.5,
        "price": 246
      },
      {
        "designation": "away",
        "points": 1.5,
        "price": -313
      }
    ],
    "status": "open",
    "type": "spread",
    "version": 988220427
  },
```

**Total over/under**

```json
  {
    "cutoffAt": "2020-04-05T06:00:00+00:00",
    "isAlternate": false,
    "key": "s;0;ou;2.5",
    "limits": [
      {
        "amount": 100,
        "type": "maxRiskStake"
      }
    ],
    "matchupId": 1117209721,
    "period": 0,
    "prices": [
      {
        "designation": "over",
        "points": 2.5,
        "price": -106
      },
      {
        "designation": "under",
        "points": 2.5,
        "price": -125
      }
    ],
    "status": "open",
    "type": "total",
    "version": 988220427
  },
```

**Moneyline**

This is a special kind of moneyline market, where the `participantId` maps to something that's not actually a participant. This case is an Odd/Even moneyline. So the Odd/Even values must be taken from the matchup root `participants` property.

```json
  {
    "cutoffAt": "2020-04-05T06:00:00+00:00",
    "key": "s;2;m",
    "limits": [
      {
        "amount": 100,
        "type": "maxRiskStake"
      }
    ],
    "matchupId": 1117212490,
    "period": 2,
    "prices": [
      {
        "participantId": 1117212491,
        "price": -115
      },
      {
        "participantId": 1117212492,
        "price": -115
      }
    ],
    "type": "moneyline",
    "version": 481499197
  },
```

**Team Total**

```json
  {
    "cutoffAt": "2020-04-05T06:00:00+00:00",
    "isAlternate": false,
    "key": "s;2;tt;10.5;away",
    "limits": [
      {
        "amount": 100,
        "type": "maxRiskStake"
      }
    ],
    "matchupId": 1117213287,
    "period": 2,
    "prices": [
      {
        "designation": "over",
        "points": 10.5,
        "price": -111
      },
      {
        "designation": "under",
        "points": 10.5,
        "price": -119
      }
    ],
    "side": "away",
    "status": "open",
    "type": "team_total",
    "version": 988243230
  },
```

```json
]
```

# Strategy

## Structure summary

The most important information on the **markets** responses are:

- **`key`**: the only information that can't be found anywhere else is after the 4th semi-collon on `"s;2;tt;14.5;away"`. `"away"` refers to the team in the `"team_total"` type of market. it's values can be `"home"` or `"away"`.
- **`period`**: always the high level period. In the case of e-sports, even if there are rounds, the period property will always refer to the current map being played
- **`type`**: possible values are:
  - `"moneyline"`: a set of options (can be a team or something else like odd/even options), depending on the related matchup
  - `"total"`: over/under points (could be anything, depending on the `units` of the matchup that it belongs to)
  - `"team_total"` same as `"total"`, but with a team that can be found in the `key` property
  - `"spread"`: always refers to handicap
- **`prices`**: it's format depends on the value of the `type` property:
  - `"moneyline"`: depending on the related matchup, can have either:
    - `designation` for the team; or
    - `participantId` for different things
  - `"total"`:
    - `designation` is always either `"over"` or `"under"`;
    - `points` complements the `designation`.
  - `"team_total"`: same as `"total"`
  - `"spread"`:
    - `designation` is always either `"home"` or `"away"`
    - `points` complements the `designation`

## Algorithm

- get markets
- from the matchup (by `matchupId`)
  - get event data
    - start time
    - participants
      - if there's a parent (`parentId` not null)
        - get `participants` from the `parent`
      - else, get `participants` from itself
- get the type

  - if `type` is `special`
    - matchup should have a parent
    - `units` should be null
    - get `units` from matchup's `special.description`
    - get options from matchup's `participants`
    - get prices matching `participant.#.participantId` from matchup with parent's `participant.#.id`
  - else `type` is `matchup`
    - if `parentId` is not `null`
      - `units` is something custom
      - ``
    - else `parentId` is `null` and `units` is `"Regular"`
      - do what we currently do
  - switch

    - case `moneyline`
      - else it's a root matchup
        - use `designation`
    - case `total`

      - if matchup has a parent

      - else it's a root matchup
        - .

    - case `team_total`
      - if matchup has a parent
        - .
      - else it's a root matchup
        - .
    - case `spread`
      - if matchup has a parent
        - .
      - else it's a root matchup
        - .

# To-do

- **Understand `status` in the markets endpoint:** does it mean that, when `status` is not `"open"`, a bet cannot be placed?
