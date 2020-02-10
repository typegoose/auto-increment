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

export interface AutoIncrementOptionsID {
  /**
   * How much to increment the field by
   * @default 1
   */
  incrementBy?: number;
  /**
   * The Tracker Collection to use to keep track of an counter for the ID
   * @default idtracker
   */
  trackerCollection?: string;
  /**
   * Set the field to increment
   * -> Only use this if it is not "_id"
   * @default _id
   */
  field?: string;
  /**
   * Set the tracker model name
   * @default idtracker
   */
  trackerModelName?: string;
}

export interface AutoIncrementIDTrackerSpec {
  /** The ModelName from the current model */
  m: string;
  /** The field in the schema */
  f: string;
  /** Current Tracker count */
  c: number;
}
