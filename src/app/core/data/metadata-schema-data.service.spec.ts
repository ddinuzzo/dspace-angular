import { RequestService } from './request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { MetadataSchemaDataService } from './metadata-schema-data.service';
import { of as observableOf } from 'rxjs';
import { RestResponse } from '../cache/response.models';
import { HALEndpointServiceStub } from '../../shared/testing/hal-endpoint-service.stub';
import { MetadataSchema } from '../metadata/metadata-schema.model';
import { CreateRequest, PutRequest } from './request.models';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';

describe('MetadataSchemaDataService', () => {
  let metadataSchemaService: MetadataSchemaDataService;
  let requestService: RequestService;
  let halService: HALEndpointService;
  let notificationsService: NotificationsService;
  let rdbService: RemoteDataBuildService;

  const endpoint = 'api/metadataschema/endpoint';

  function init() {
    requestService = jasmine.createSpyObj('requestService', {
      generateRequestId: '34cfed7c-f597-49ef-9cbe-ea351f0023c2',
      configure: {},
      getByUUID: observableOf({ response: new RestResponse(true, 200, 'OK') }),
      removeByHrefSubstring: {}
    });
    halService = Object.assign(new HALEndpointServiceStub(endpoint));
    notificationsService = jasmine.createSpyObj('notificationsService', {
      error: {}
    });
    rdbService = jasmine.createSpyObj('rdbService', {
      buildSingle: createSuccessfulRemoteDataObject$(undefined)
    });
    metadataSchemaService = new MetadataSchemaDataService(requestService, rdbService, undefined, halService, undefined, undefined, undefined, notificationsService);
  }

  beforeEach(() => {
    init();
  });

  describe('createOrUpdateMetadataSchema', () => {
    let schema: MetadataSchema;

    beforeEach(() => {
      schema = Object.assign(new MetadataSchema(), {
        prefix: 'dc',
        namespace: 'namespace',
        _links: {
          self: { href: 'selflink' }
        }
      });
    });

    describe('called with a new metadata schema', () => {
      it('should send a CreateRequest', (done) => {
        metadataSchemaService.createOrUpdateMetadataSchema(schema).subscribe(() => {
          expect(requestService.configure).toHaveBeenCalledWith(jasmine.any(CreateRequest));
          done();
        });
      });
    });

    describe('called with an existing metadata schema', () => {
      beforeEach(() => {
        schema = Object.assign(schema, {
          id: 'id-of-existing-schema'
        });
      });

      it('should send a PutRequest', (done) => {
        metadataSchemaService.createOrUpdateMetadataSchema(schema).subscribe(() => {
          expect(requestService.configure).toHaveBeenCalledWith(jasmine.any(PutRequest));
          done();
        });
      });
    });
  });

  describe('clearRequests', () => {
    it('should remove requests on the data service\'s endpoint', (done) => {
      metadataSchemaService.clearRequests().subscribe(() => {
        expect(requestService.removeByHrefSubstring).toHaveBeenCalledWith(`${endpoint}/${(metadataSchemaService as any).linkPath}`);
        done();
      });
    });
  });
});
