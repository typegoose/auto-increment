# Typegoose Automatic Increment

[![Build Status](https://travis-ci.com/typegoose/auto-increment.svg?branch=master)](https://travis-ci.com/typegoose/auto-increment)
[![Coverage Status](https://coveralls.io/repos/github/typegoose/auto-increment/badge.svg?branch=master#feb282019)](https://coveralls.io/github/typegoose/auto-increment?branch=master)
[![npm](https://img.shields.io/npm/dt/@typegoose/auto-increment.svg)](https://www.npmjs.com/package/@typegoose/auto-increment)

Automaticly Increment properties

## Basic Usage

(mongoose)
```ts
const schema = new mongoose.Schema({
  somefield: Number
});
schema.plugin(AutoIncrement, [{ field: 'somefield' }]);
const model = mongoose.model('SomeModel', schema);

const doc = await model.create({ somefield: 10 });

await doc.save(); // somefield will be 11
```

(typegoose)
```ts
@plugin(AutoIncrement, [{ field: "someIncrementedField" }])
class SomeClass {
  @prop() // does not need to be empty
  public someIncrementedField: number;
}

const SomeModel = getModelForClass(SomeClass);

const doc = await SomeModel.create({ someIncrementedField: 10 });

await doc.save(); // someIncrementedField will be 11
```

## Motivation

I started `@typegoose/auto-increment` because `mongoose-auto-increment` and `mongoose-auto-increment-reworked` are archived and didnt get any update for at least 2 years, and there were many issues about them in [typegoose](https://github.com/typegoose/typegoose) so i thought it will be easy to make an up-to-date automatic incrementing plugin

## Requirements

- Node 8.10+
- TypeScript 3.7+ (older versions could work, but are not tested)
- mongoose 5.8+ (5.x could work, but are not tested)

## Install

`npm i -s @typegoose/auto-increment`

You also need to install `mongoose`, because this plugin is made for `mongoose`

## Testing

`npm run test` / `npm run test:watch`

## Versioning

`Major.Minor.Fix` (or how npm expresses it `Major.Minor.Patch`)  
(This Project should comply with [Semver](https://semver.org))

## Join Our Discord Server

To ask questions or just talk with us [join our Discord Server](https://discord.gg/BpGjTTD)

## Documentation

### Plugin - Options

they can either be an object or an array of objects (single field / multiple fields)

#### field

`string`

This option is always required to get which field to increment

#### incrementBy

`number` default `1`

This option is optional, default is to increment by `1`

## Notes

* Please dont add comments with `+1` or something like that, use the Reactions
* `npm run doc` generates all documentation for all files that can be used as modules (is used for github-pages)
* `npm run doc:all` generates documentation even for internal modules
