import { Component, input, output, inject, signal, computed, effect, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BlockUiService } from '../../../core/services/block-ui.service';
import { Result } from '../../models/results/result.model';

@Component({
  selector: 'app-role-personnel-select',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './role-personnel-select.html',
  host: { 'class': 'block w-full' }
})
export class RolePersonnelSelectComponent<T extends { id: string }> implements OnInit {
  private translate = inject(TranslateService);
  private blockUi = inject(BlockUiService);

  targetId = input<string | 'null'>('null'); // roleId

  // Artık dönüş tipi generic <T[]> - hangi DTO gelirse gelsin sorun çıkarmaz
  fetchAllPersonnel = input.required<() => Observable<Result<T[]>>>();
  fetchAssignedPersonnel = input<((id: string) => Observable<Result<string[]>>) | null>(null);

  // Salt-okunur (goruntuleme) modu — true ise secim degistirilemez, toolbar aksiyonlari gizli
  readonly = input<boolean>(false);

  // DTO'dan ekranda gösterilecek etiketi nasıl çıkaracağımızı parent belirler
  labelFn = input<(item: T) => string>((item: any) => item.fullName ?? item.name ?? String(item.id));

  personnelChange = output<string[]>();

  searchQuery = signal<string>('');
  allPersonnel = signal<T[]>([]);
  selectedIds = signal<Set<string>>(new Set());

  filteredPersonnel = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.allPersonnel();
    if (!query) return list;
    const getLabel = this.labelFn();
    return list.filter(p => getLabel(p).toLowerCase().includes(query));
  });

  constructor() {
    effect(() => {
      const id = this.targetId();
      const assignedFn = this.fetchAssignedPersonnel();
      if (id && id !== 'null' && assignedFn) {
        this.loadAssignedPersonnel(id, assignedFn);
      } else {
        this.selectedIds.set(new Set());
        this.emitSelected();
      }
    });
  }

  ngOnInit(): void {
    this.loadAllPersonnel();
  }

  t(key: string): string {
    return this.translate.instant(key);
  }

  getLabel(item: T): string {
    return this.labelFn()(item);
  }

  private loadAllPersonnel(): void {
    this.blockUi.block();
    this.fetchAllPersonnel()().subscribe({
      next: (res) => {
        this.blockUi.unblock();
        if (res.isSuccess && res.value) this.allPersonnel.set(res.value);
      },
      error: () => this.blockUi.unblock()
    });
  }

  private loadAssignedPersonnel(id: string, fetchFn: (id: string) => Observable<Result<string[]>>): void {
    this.blockUi.block();
    fetchFn(id).subscribe({
      next: (res) => {
        this.blockUi.unblock();
        this.selectedIds.set(new Set(res.isSuccess && res.value ? res.value : []));
        this.emitSelected();
      },
      error: () => {
        this.blockUi.unblock();
        this.selectedIds.set(new Set());
        this.emitSelected();
      }
    });
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggle(id: string, event: Event): void {
    if (this.readonly()) return;
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedIds());
    checked ? next.add(id) : next.delete(id);
    this.selectedIds.set(next);
    this.emitSelected();
  }

  selectAll(): void {
    if (this.readonly()) return;
    const next = new Set(this.selectedIds());
    this.filteredPersonnel().forEach(p => next.add(p.id));
    this.selectedIds.set(next);
    this.emitSelected();
  }

  clearAll(): void {
    if (this.readonly()) return;
    const next = new Set(this.selectedIds());
    this.filteredPersonnel().forEach(p => next.delete(p.id));
    this.selectedIds.set(next);
    this.emitSelected();
  }

  private emitSelected(): void {
    this.personnelChange.emit(Array.from(this.selectedIds()));
  }
}