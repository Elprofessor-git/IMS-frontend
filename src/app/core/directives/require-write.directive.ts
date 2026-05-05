import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../services/permission.service';

@Directive({ selector: '[requireWrite]', standalone: true })
export class RequireWriteDirective implements OnInit, OnDestroy {
  @Input() requireWrite = '';
  private sub!: Subscription;

  constructor(private el: ElementRef, private perm: PermissionService) {}

  ngOnInit(): void {
    this.applyPermission();
    this.sub = this.perm.perms$.subscribe(() => this.applyPermission());
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private applyPermission(): void {
    const allowed = !this.requireWrite || this.perm.canWrite(this.requireWrite);
    this.el.nativeElement.style.display = allowed ? '' : 'none';
  }
}
