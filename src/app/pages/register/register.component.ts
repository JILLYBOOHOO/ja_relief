
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { SurvivorService } from './survivor.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  survivorForm!: FormGroup;
  today: string = '';

  parishesList: string[] = [
    'Kingston', 'St Andrew', 'St Catherine', 'Clarendon', 'Manchester',
    'St Elizabeth', 'Westmoreland', 'Hanover', 'St James', 'Trelawny',
    'St Ann', 'St Mary', 'Portland', 'St Thomas'
  ];

  idFile: File | null = null;
  idPreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private survivorService: SurvivorService
  ) { }

  ngOnInit(): void {
    // Prevent future DOB
    this.today = new Date().toISOString().split('T')[0];

    // Form setup
    this.survivorForm = this.fb.group({
      fullName: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{7,}$')]],
      idType: ['', Validators.required],
      idNumber: ['', Validators.required],
      provisional: [false],
      parish: ['', Validators.required],
      address: [''],
      dob: ['', Validators.required],
      damageLevel: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Conditional ID validation
    this.survivorForm.get('provisional')?.valueChanges.subscribe(isProv => {
      const idType = this.survivorForm.get('idType');
      const idNumber = this.survivorForm.get('idNumber');

      if (isProv) {
        idType?.clearValidators();
        idNumber?.clearValidators();
      } else {
        idType?.setValidators(Validators.required);
        idNumber?.setValidators(Validators.required);
      }

      idType?.updateValueAndValidity();
      idNumber?.updateValueAndValidity();
    });
  }

  // ID upload / scan
  onFileSelected(event: any): void {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    this.idFile = file;

    const reader = new FileReader();
    reader.onload = () => this.idPreview = reader.result;
    reader.readAsDataURL(file);
  }

  // Fix: Add the method referenced in your HTML
  onIdScanSelected(event: any): void {
    this.onFileSelected(event);
  }

  // Submit form
  submit(): void {
    if (this.survivorForm.invalid) {
      this.survivorForm.markAllAsTouched();
      alert('Please complete all required fields');
      return;
    }

    const formData = new FormData();

    Object.entries(this.survivorForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string);
      }
    });

    if (this.idFile) {
      formData.append('idScan', this.idFile);
    }

    this.survivorService.registerSurvivor(formData).subscribe({
      next: () => alert('Registration successful'),
      error: () => alert('Registration failed')
    });
  }
}
