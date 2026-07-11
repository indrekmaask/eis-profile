import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  DdsBadge,
  DdsButton,
  DdsCard,
  DdsCompleteness,
  DdsContactBlock,
  DdsDropdown,
  DdsInput,
  DdsOption,
  DdsPhoneInput,
  DdsRegistryField,
  DdsRegistryProvenance,
  DdsStep,
  DdsStepper,
  DdsTagInput,
} from '@dds/ui';

/** Phase 3 component gallery — validates DDS2 tokens + components render per Figma. */
@Component({
  selector: 'app-dds-showcase',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DdsButton,
    DdsInput,
    DdsDropdown,
    DdsBadge,
    DdsCard,
    DdsPhoneInput,
    DdsRegistryField,
    DdsRegistryProvenance,
    DdsContactBlock,
    DdsCompleteness,
    DdsStepper,
    DdsTagInput,
  ],
  templateUrl: './dds-showcase.html',
  styleUrl: './dds-showcase.scss',
})
export class DdsShowcase {
  protected readonly steps: DdsStep[] = [
    { label: 'Üldandmed' },
    { label: 'Kontaktandmed' },
    { label: 'Seotud isikud' },
    { label: 'Muu' },
  ];
  protected readonly activeStep = signal(1);

  protected readonly legalForms: DdsOption[] = [
    { value: 'OU', label: 'Osaühing' },
    { value: 'AS', label: 'Aktsiaselts' },
    { value: 'FIE', label: 'Füüsilisest isikust ettevõtja' },
  ];

  protected readonly markets: DdsOption[] = [
    { value: 'FI', label: 'Soome' },
    { value: 'SE', label: 'Rootsi' },
    { value: 'LV', label: 'Läti' },
    { value: 'LT', label: 'Leedu' },
    { value: 'DE', label: 'Saksamaa' },
  ];

  protected readonly regions: DdsOption[] = [
    { value: 'TARTU', label: 'Tartu maakond' },
    { value: 'HARJU', label: 'Harju maakond' },
    { value: 'PARNU', label: 'Pärnu maakond' },
  ];

  protected readonly form = new FormGroup({
    email: new FormControl('mari@porgand.ee'),
    legalForm: new FormControl('OU'),
    phone: new FormControl('+372 5551 2345'),
    markets: new FormControl<string[]>(['FI', 'SE']),
    regions: new FormControl<string[]>(['TARTU']),
  });

  protected selectStep(i: number): void {
    this.activeStep.set(i);
  }
}
