import { merge } from 'lodash';
import * as mongoose from 'mongoose';
import { isNullOrUndefined } from 'util';
import { logger } from './logSettings';
import { AutoIncrementIDOptions, AutoIncrementIDTrackerSpec, AutoIncrementOptionsSimple } from './types';

const DEFAULT_INCREMENT = 1;

/**
 * The Plugin - Simple version
 * Increments an value each time it is saved
 * @param schema The Schema
 * @param options The Options
 */
export function AutoIncrementSimple(
  schema: mongoose.Schema<any>,
  options: AutoIncrementOptionsSimple[] | AutoIncrementOptionsSimple
): void {
  // convert normal object into an array
  const fields: AutoIncrementOptionsSimple[] = Array.isArray(options) ? options : [options];
  logger.info('Initilaize AutoIncrement for an schema with %d fields to increment', fields.length);

  if (fields.length <= 0) {
    throw new Error('Options with at least one field are required!');
  }

  // check if all fields are valid
  for (const field of fields) {
    const schemaField = schema.path(field.field);
    // check if the field is even existing
    if (isNullOrUndefined(schemaField)) {
      throw new Error(`Field "${field.field}" does not exists on the Schema!`);
    }
    // check if the field is an number
    if (!(schemaField instanceof mongoose.Schema.Types.Number)) {
      throw new Error(`Field "${field.field}" is not an SchemaNumber!`);
    }

    if (isNullOrUndefined(field.incrementBy)) {
      logger.info('Field "%s" does not have an incrementBy defined, defaulting to %d', field.field, DEFAULT_INCREMENT);
      field.incrementBy = DEFAULT_INCREMENT;
    }
  }
  schema.pre('save', function AutoIncrementPreSaveSimple() { // to have an name to the function if debugging
    if (!this.isNew) {
      logger.info('Starting to increment "%s"', (this.constructor as mongoose.Model<any>).modelName);
      for (const field of fields) {
        logger.info('Incrementing "%s" by %d', field.field, field.incrementBy);
        this[field.field] += field.incrementBy;
      }
    }
  });
}

/** The Schema used for the trackers */
const IDSchema = new mongoose.Schema({
  field: String,
  model: String,
  count: Number
}, { versionKey: false });
IDSchema.index({ field: 1, model: 1 }, { unique: true });

/**
 * The Plugin - ID
 * Increments an counter in an tracking collection
 * @param schema The Schema
 * @param options The Options
 */
export function AutoIncrementID(schema: mongoose.Schema<any>, options: AutoIncrementIDOptions): void {
  /** The Options with default options applied */
  const opt: Required<AutoIncrementIDOptions> = merge({}, {
    field: '_id',
    incrementBy: DEFAULT_INCREMENT,
    trackerCollection: 'identitycounters',
    trackerModelName: 'identitycounter',
    startAt: 0
  } as Required<AutoIncrementIDOptions>, options) as Required<AutoIncrementIDOptions>;

  // check if the field is an number
  if (!(schema.path(opt.field) instanceof mongoose.Schema.Types.Number)) {
    throw new Error(`Field "${opt.field}" is not an SchemaNumber!`);
  }

  let model: mongoose.Model<mongoose.Document & AutoIncrementIDTrackerSpec>;

  logger.info('AutoIncrementID called with options %O', opt);

  schema.pre('save', async function AutoIncrementPreSaveID(): Promise<void> {
    logger.info('AutoIncrementID PreSave');
    if (!this.isNew) {
      logger.info('Document is not new, not incrementing');

      return;
    }

    const modelName: string = (this.constructor as any).modelName;

    if (!model) {
      logger.info('Creating idtracker model named "%s"', opt.trackerModelName);
      // needs to be done, otherwise "undefiend" error if the plugin is used in an sub-document
      const db: mongoose.Connection = this.db ?? (this as any).ownerDocument().db;
      model = db.model(opt.trackerModelName, IDSchema, opt.trackerCollection);
      // test if the counter document already exists
      const counter = await model.findOne({ model: modelName, field: opt.field }).lean().exec();
      if (!counter) {
        await model.create({
          model: modelName,
          field: opt.field,
          count: opt.startAt - opt.incrementBy
        } as AutoIncrementIDTrackerSpec);
      }
    }

    const { count }: { count: number; } = await model.findOneAndUpdate({
      field: opt.field,
      model: modelName
    } as AutoIncrementIDTrackerSpec, {
      $inc: { count: opt.incrementBy }
    }, {
      new: true,
      fields: { count: 1, _id: 0 },
      upsert: true,
      setDefaultsOnInsert: true
    }).lean().exec();

    logger.info('Setting "%s" to "%d"', opt.field, count);
    this[opt.field] = count;

    return;
  });
}

export * from './types';
