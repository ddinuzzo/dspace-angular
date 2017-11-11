import { Component, Input, OnInit } from '@angular/core';
import {
  DynamicScrollableDropdownModel,
  DynamicScrollableDropdownResponseModel
} from './dynamic-scrollable-dropdown.model';
import { FormGroup } from '@angular/forms';
import { PageInfo } from '../../../../../../core/shared/page-info.model';
import { isNull, isUndefined } from '../../../../../empty.util';

@Component({
  selector: 'ds-dynamic-scrollable-dropdown',
  styleUrls: ['./dynamic-scrollable-dropdown.component.scss'],
  templateUrl: './dynamic-scrollable-dropdown.component.html'
})
export class DsDynamicScrollableDropdownComponent implements OnInit {
  @Input() bindId = true;
  @Input() group: FormGroup;
  @Input() model: DynamicScrollableDropdownModel;
  @Input() showErrorMessages = false;

  public loading = false;
  public pageInfo: PageInfo;
  public optionsList: any;

  ngOnInit() {
    this.model.retrieve(this.pageInfo)
      .subscribe((object: DynamicScrollableDropdownResponseModel) => {
        this.optionsList = object.list;
        this.pageInfo = object.pageInfo;
      })
  }

  public formatItemForInput(item: any): string {
    if (isUndefined(item) || isNull(item)) { return '' }
    return (typeof item === 'string') ? item : this.inputFormatter(item);
  }

  inputFormatter = (x: {display: string}) => x.display;

  onScroll() {
    if (!this.loading && this.pageInfo.currentPage <= this.pageInfo.totalPages) {
      this.loading = true;
      this.pageInfo.currentPage++;
      this.model.retrieve(this.pageInfo)
        .do(() => this.loading = false)
        .subscribe((object) => {
          this.optionsList = this.optionsList.concat(object.list);
          this.pageInfo = object.pageInfo;

        })
    }
  }

  onSelect(event) {
    this.group.markAsDirty();
    this.group.controls[this.model.id].setValue(event);
  }
}