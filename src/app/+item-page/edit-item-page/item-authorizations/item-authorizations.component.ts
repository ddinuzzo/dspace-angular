import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, of as observableOf, Subscription } from 'rxjs';
import { catchError, filter, first, flatMap, map, take } from 'rxjs/operators';

import { ResourcePolicyService } from '../../../core/resource-policy/resource-policy.service';
import { PaginatedList } from '../../../core/data/paginated-list';
import { getFirstSucceededRemoteDataPayload } from '../../../core/shared/operators';
import { Item } from '../../../core/shared/item.model';
import { followLink } from '../../../shared/utils/follow-link-config.model';
import { LinkService } from '../../../core/cache/builders/link.service';
import { Bundle } from '../../../core/shared/bundle.model';
import { hasValue, isNotEmpty } from '../../../shared/empty.util';
import { Bitstream } from '../../../core/shared/bitstream.model';
import { FindListOptions } from '../../../core/data/request.models';

interface BundleBitstreamsMapEntry {
  id: string;
  bitstreams: Observable<PaginatedList<Bitstream>>
}

@Component({
  selector: 'ds-item-authorizations',
  templateUrl: './item-authorizations.component.html'
})
/**
 * Component that handles the item Authorizations
 */
export class ItemAuthorizationsComponent implements OnInit, OnDestroy {

  public bundleBitstreamsMap: Map<string, Observable<PaginatedList<Bitstream>>> = new Map<string, Observable<PaginatedList<Bitstream>>>();

  /**
   * The list of bundle for the item
   * @type {Observable<PaginatedList<Bundle>>}
   */
  private bundles$: Observable<PaginatedList<Bundle>>;

  /**
   * The target editing item
   * @type {Observable<Item>}
   */
  private item$: Observable<Item>;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  private subs: Subscription[] = [];

  /**
   * Initialize instance variables
   *
   * @param {LinkService} linkService
   * @param {ResourcePolicyService} resourcePolicyService
   * @param {ActivatedRoute} route
   */
  constructor(
    private linkService: LinkService,
    private resourcePolicyService: ResourcePolicyService,
    private route: ActivatedRoute
  ) {
  }

  /**
   * Initialize the component, setting up the bundle and bitstream within the item
   */
  ngOnInit(): void {
    this.item$ = this.route.data.pipe(
      map((data) => data.item),
      getFirstSucceededRemoteDataPayload(),
      map((item: Item) => this.linkService.resolveLink(
        item,
        followLink('bundles', new FindListOptions(), true, followLink('bitstreams'))
      ))
    ) as Observable<Item>;

    this.bundles$ = this.item$.pipe(
      filter((item: Item) => isNotEmpty(item.bundles)),
      flatMap((item: Item) => item.bundles),
      getFirstSucceededRemoteDataPayload(),
      catchError(() => observableOf(new PaginatedList(null, [])))
    );

    this.subs.push(
      this.bundles$.pipe(
        take(1),
        flatMap((list: PaginatedList<Bundle>) => list.page),
        map((bundle: Bundle) => ({ id: bundle.id, bitstreams: this.getBundleBitstreams(bundle) }))
      ).subscribe((entry: BundleBitstreamsMapEntry) => {
        this.bundleBitstreamsMap.set(entry.id, entry.bitstreams)
      })
    )
  }

  /**
   * Return the item's UUID
   */
  getItemUUID(): Observable<string> {
    return this.item$.pipe(
      map((item: Item) => item.id),
      first((UUID: string) => isNotEmpty(UUID))
    )
  }

  /**
   * Return all item's bundles
   *
   * @return an observable that emits all item's bundles
   */
  getItemBundles(): Observable<PaginatedList<Bundle>> {
    return this.bundles$
  }

  /**
   * Return all bundle's bitstreams
   *
   * @return an observable that emits all item's bundles
   */
  private getBundleBitstreams(bundle: Bundle): Observable<PaginatedList<Bitstream>> {
    return bundle.bitstreams.pipe(
      getFirstSucceededRemoteDataPayload(),
      catchError(() => observableOf(new PaginatedList(null, [])))
    )
  }

  /**
   * Unsubscribe from all subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe())
  }
}