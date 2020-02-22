export interface AutoIncrementOptionsSimple {
  /** Which Field to increment on save */
  field: string;
  /**
   * How much to increment the field by
   * @default 1
   */
  incrementBy?: number;
}

export type AutoIncrementSimplePluginOptions = AutoIncrementOptionsSimple | AutoIncrementOptionsSimple[];

export interface AutoIncrementIDOptions {
  /**
   * How much to increment the field by
   * @default 1
   */
  incrementBy?: number;
  /**
   * Set the field to increment
   * -> Only use this if it is not "_id"
   * @default _id
   */
  field?: string;
  /**
   * The Tracker Collection to use to keep track of an counter for the ID
   * @default identitycounters
   */
  trackerCollection?: string;
  /**
   * Set the tracker model name
   * @default identitycounter
   */
  trackerModelName?: string;
  /**
   * model to configure the plugin for
   */
  model: string;
  /**
   * the count should start at
   * @default 0
   */
  startAt?: number;
}

export interface AutoIncrementIDTrackerSpec {
  /** The ModelName from the current model */
  model: string;
  /** The field in the schema */
  field: string;
  /** Current Tracker count */
  count: number;
}
