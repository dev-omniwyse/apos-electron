import { TestBed } from '@angular/core/testing';

import { CdtaService } from './cdta.service';

describe('CdtaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CdtaService = TestBed.get(CdtaService);
    expect(service).toBeTruthy();
  });
});
