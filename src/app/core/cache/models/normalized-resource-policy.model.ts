import { mapsTo } from '../builders/build-decorators';
import { autoserialize, inheritSerialization } from 'cerialize';
import { NormalizedDSpaceObject } from './normalized-dspace-object.model';
import { ResourcePolicy } from '../../shared/resource-policy.model';

@mapsTo(ResourcePolicy)
@inheritSerialization(NormalizedDSpaceObject)
export class NormalizedResourcePolicy extends NormalizedDSpaceObject {

  /**
   * The identifier of the access condition
   */
  @autoserialize
  id: string;

  /**
   * The group uuid bound to the access condition
   */
  @autoserialize
  groupUUID: string;

  /**
   * The end date of the access condition
   */
  @autoserialize
  endDate: string;
}