import { Inject, Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { GLOBAL_CONFIG, GlobalConfig } from '../../../config';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ResponseCacheService } from '../cache/response-cache.service';
import { CoreState } from '../core.reducers';

import { RequestService } from '../data/request.service';
import { NormalizedClaimedTask } from './models/normalized-claimed-task-object.model';
import { ClaimedTask } from './models/claimed-task-object.model';
import { ErrorResponse, RestResponse, TaskResponse } from '../cache/response-cache.models';
import { HttpHeaders } from '@angular/common/http';
import { HttpOptions } from '../dspace-rest-v2/dspace-rest-v2.service';
import { DeleteRequest, PostRequest, RestRequest, TaskDeleteRequest, TaskPostRequest } from '../data/request.models';
import { isEmpty, isNotEmpty } from '../../shared/empty.util';
import { ResponseCacheEntry } from '../cache/response-cache.reducer';
import { TasksService } from './tasks.service';

@Injectable()
export class ClaimedTaskDataService extends TasksService<NormalizedClaimedTask, ClaimedTask> {
  protected linkName = 'claimedtasks';
  protected overrideRequest = true;

  constructor(protected responseCache: ResponseCacheService,
              protected requestService: RequestService,
              protected rdbService: RemoteDataBuildService,
              protected store: Store<CoreState>,
              @Inject(GLOBAL_CONFIG) protected EnvConfig: GlobalConfig) {
    super(NormalizedClaimedTask);
  }

  public approveTask(scopeId: string ): Observable<any> {
    const body = {
      submit_approve: 'true'
    };
    return this.postToEndpoint('', this.prepareBody(body), scopeId, this.makeHttpOptions());
  }

  public rejectTask(reason: string, scopeId: string ): Observable<any> {
    const body = {
      submit_reject: 'true',
      reason
    };
    return this.postToEndpoint('', this.prepareBody(body), scopeId, this.makeHttpOptions());
  }

  public returnToPoolTask(scopeId: string ): Observable<any> {
    return this.deleteToEndpoint('', {}, scopeId, this.makeHttpOptions());
  }

  protected getEndpointByIDHref(endpoint, resourceID): string {
    return isNotEmpty(resourceID) ? `${endpoint}/${resourceID}` : `${endpoint}`;
  }

}