import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language';
import { GacamApiService, UserListDto, CreateUserByAdminDto } from '../../../core/services/gacam-api';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, TranslatePipe],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  private svc = inject(GacamApiService);
  langService = inject(LanguageService);
  authService = inject(AuthService);

  users = signal<UserListDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  roleFilter = signal<string>('');
  searchTerm = signal('');

  showCreateModal = signal(false);
  showRoleModal = signal(false);
  showDeleteModal = signal(false);
  selectedUser = signal<UserListDto | null>(null);

  createForm: CreateUserByAdminDto = { email: '', firstName: '', lastName: '', role: 'Employee' };
  createLoading = signal(false);

  newRole = signal<'Admin' | 'Employee'>('Employee');
  roleLoading = signal(false);

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(u =>
      !term ||
      u.email.toLowerCase().includes(term) ||
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.svc.getUserManagementList(this.roleFilter() || undefined).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users.');
        this.loading.set(false);
      }
    });
  }

  openCreate() {
    this.createForm = { email: '', firstName: '', lastName: '', role: 'Employee' };
    this.showCreateModal.set(true);
  }

  submitCreate() {
    this.createLoading.set(true);
    this.svc.createManagedUser(this.createForm).subscribe({
      next: (user) => {
        this.users.update(list => [user, ...list]);
        this.showCreateModal.set(false);
        this.createLoading.set(false);
        this.flash('User created successfully and invite email sent.');
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to create user.');
        this.createLoading.set(false);
      }
    });
  }

  openRoleChange(user: UserListDto) {
    this.selectedUser.set(user);
    this.newRole.set(user.role === 'Admin' ? 'Employee' : 'Admin');
    this.showRoleModal.set(true);
  }

  submitRoleChange() {
    const user = this.selectedUser();
    if (!user) return;
    this.roleLoading.set(true);
    this.svc.changeManagedUserRole(user.id, this.newRole()).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, role: this.newRole() } : u)
        );
        this.showRoleModal.set(false);
        this.roleLoading.set(false);
        this.flash('Role updated successfully.');
      },
      error: () => {
        this.error.set('Failed to update role.');
        this.roleLoading.set(false);
      }
    });
  }

  toggleActive(user: UserListDto) {
    this.svc.toggleManagedUserActive(user.id).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
        );
        this.flash(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
      },
      error: () => this.error.set('Failed to toggle user status.')
    });
  }

  openDelete(user: UserListDto) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  confirmDelete() {
    const user = this.selectedUser();
    if (!user) return;
    this.svc.deleteManagedUser(user.id).subscribe({
      next: () => {
        this.users.update(list => list.filter(u => u.id !== user.id));
        this.showDeleteModal.set(false);
        this.flash('User deleted.');
      },
      error: () => this.error.set('Failed to delete user.')
    });
  }

  private flash(msg: string) {
    this.successMsg.set(msg);
    this.error.set(null);
    setTimeout(() => this.successMsg.set(null), 4000);
  }

  getRoleBadgeClass(role: string): string {
    return role === 'Admin'
      ? 'bg-champagne-gold/20 text-champagne-gold border border-champagne-gold/40'
      : 'bg-royal-teal/10 text-royal-teal border border-royal-teal/20';
  }

  closeModals() {
    this.showCreateModal.set(false);
    this.showRoleModal.set(false);
    this.showDeleteModal.set(false);
  }
}