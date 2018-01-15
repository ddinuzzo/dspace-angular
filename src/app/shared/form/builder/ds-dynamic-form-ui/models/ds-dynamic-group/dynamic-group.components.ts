import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {DynamicGroupModel} from './dynamic-group.model';
import {FormBuilderService} from '../../../form-builder.service';
import {DynamicFormControlModel, DynamicFormGroupModel, DynamicInputModel, serializable} from '@ng-dynamic-forms/core';
import {SubmissionFormsModel} from '../../../../../../core/shared/config/config-submission-forms.model';
import {FormService} from '../../../../form.service';
import {FormComponent} from '../../../../form.component';
import {Chips, ChipsItem} from '../../../../../chips/chips.model';

const PLACEHOLDER = '#PLACEHOLDER_PARENT_METADATA_VALUE#';

@Component({
  selector: 'ds-dynamic-group',
  templateUrl: './dynamic-group.component.html',
})
export class DsDynamicGroupComponent implements OnInit {
  public formModel: DynamicFormControlModel[];
  public editMode = false;
  private selectedChips: ChipsItem;

  @serializable() chips: Chips;

  @Input() formId: string;
  @Input() model: DynamicGroupModel;

  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Output() change: EventEmitter<any> = new EventEmitter<any>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('formRef') private formRef: FormComponent;

  constructor(private formBuilderService: FormBuilderService, private formService: FormService) {
  }

  ngOnInit() {
    const config = {rows: this.model.formConfiguration} as SubmissionFormsModel;
    this.formId = this.formService.getUniqueId(this.model.id);
    this.formModel = this.formBuilderService.modelFromConfiguration(config, {});
    this.chips = new Chips(this.model.value, 'value', this.model.mandatoryField);
  }

  addChips(event) {
    if (!this.formRef.formGroup.valid) {
      this.formService.validateAllFormFields(this.formRef.formGroup);
      return;
    }

    // Item to add
    const item = this.readFormItem();

    this.chips.add(item);
    this.model.valueUpdates.next(this.chips.getItems());
    this.change.emit(event);
    this.resetForm();
  }

  chipsSelected(event) {
    this.selectedChips = this.chips.chipsItems[event];
    this.formModel.forEach((row) => {
      const modelRow = row as DynamicFormGroupModel;
      modelRow.group.forEach((model: DynamicInputModel) => {
        const value = this.selectedChips.item[model.name] === PLACEHOLDER ? null : this.selectedChips.item[model.name];
        if (model instanceof DynamicInputModel) {
          model.valueUpdates.next(value);
        } else {
          (model as any).value = value;
        }
      });
    });

    this.editMode = true;
  }

  changeChips(event) {
    this.model.valueUpdates.next(this.chips.getItems());
    this.change.emit(event);
  }

  exitEditMode() {
    this.selectedChips.editMode = false;
    this.selectedChips = null;
    this.editMode = false;
    this.resetForm();
    this.change.emit(event);
  }

  modifyChips() {
    const item = this.readFormItem();
    this.selectedChips.item = item;
    this.chips.update(this.selectedChips);

    this.editMode = false;
    this.resetForm();

    this.model.valueUpdates.next(this.chips.getItems());
    this.change.emit(event);
  }

  private readFormItem() {
    const item = {};
    this.formModel.forEach((row) => {
      const modelRow = row as DynamicFormGroupModel;
      modelRow.group.forEach((control: DynamicInputModel) => {
        item[control.name] = control.value || PLACEHOLDER;
      });
    });
    return item;
  }

  private resetForm() {
    this.formService.resetForm(this.formRef.formGroup, this.formModel, this.formId);
  }

  private removeChips(event) {
    this.model.valueUpdates.next(this.chips.getItems());
    this.change.emit(event);
  }

}