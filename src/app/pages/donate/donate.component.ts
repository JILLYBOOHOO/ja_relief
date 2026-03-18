import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ImpactRequestService, ImpactRequest, RequestItem } from '../../services/impact-request.service';

declare var L: any;

@Component({
  selector: 'app-donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.css']
})
export class DonateComponent implements OnInit, AfterViewInit, OnDestroy {
  donationType: 'monetary' | 'in-kind' | 'impact-map' = 'impact-map';
  selectedPaymentMethod: string = '';
  showSuccessModal: boolean = false;
  donationAmount: number = 0;
  pledgedItems: string[] = [];

  // Card details
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  cardName: string = '';
  isCardFlipped: boolean = false;

  // Donor details for in-kind
  donorName: string = '';
  donorPhone: string = '';
  donorEmail: string = '';
  dropOffDate: string = '';
  selectedCenter: string = '';

  donationCenters = [
    { id: 'kingston', name: 'Kingston: JA RELIEF Warehouse, 123 Hope Road' },
    { id: 'mobay', name: 'Montego Bay: Community Center, 45 Barnett Street' },
    { id: 'mandeville', name: 'Mandeville: Parish Church Hall, 1 Ward Avenue' },
    { id: 'st_ann', name: 'St. Ann\'s Bay: Methodist Church, 10 Main Street' }
  ];

  // Impact Map properties
  private map: any;
  private markers: any[] = [];
  allRequests: ImpactRequest[] = [];
  selectedRequest: ImpactRequest | null = null;
  showFulfillmentModal = false;
  itemsToFulfill: { [itemName: string]: boolean } = {};

  get activeSurvivorRequests() {
    return this.allRequests.filter(req =>
      req.items.some(item => item.status === 'pending' || item.status === 'partially-fulfilled')
    ).sort((a, b) => b.timestamp - a.timestamp);
  }

  categorizedItems = [
    {
      category: 'Food & Water',
      icon: '🍱',
      items: [
        { name: 'Tin tuna', icon: '🐟', checked: false },
        { name: 'Tin sardines', icon: '🥫', checked: false },
        { name: 'Tin salmon', icon: '🍣', checked: false },
        { name: 'Tin mackerel', icon: '🐟', checked: false },
        { name: 'Tin corned beef', icon: '🥩', checked: false },
        { name: 'Tin milk (evaporated or condensed)', icon: '🥛', checked: false },
        { name: 'Tin baked beans', icon: '🥫', checked: false },
        { name: 'Bake beans', icon: '🥫', checked: false },
        { name: 'Pasta', icon: '🍝', checked: false },
        { name: 'Lasco', icon: '🥤', checked: false },
        { name: 'Oats', icon: '🥣', checked: false },
        { name: 'Ramen noodles', icon: '🍜', checked: false },
        { name: 'Bottled Water', icon: '💧', checked: false },
        { name: 'Rice', icon: '🍚', checked: false },
        { name: 'Flour', icon: '🌾', checked: false },
        { name: 'Sugar', icon: '🍬', checked: false }
      ]
    },
    {
      category: 'Emergency Supplies',
      icon: '🔦',
      items: [
        { name: 'Flashlights', icon: '🔦', checked: false },
        { name: 'Batteries', icon: '🔋', checked: false },
        { name: 'Portable phone chargers', icon: '🔌', checked: false },
        { name: 'Battery-powered radios', icon: '📻', checked: false },
        { name: 'Candles and matches', icon: '🕯️', checked: false },
        { name: 'Blankets', icon: '🛌', checked: false },
        { name: 'Sleeping mats', icon: '😴', checked: false }
      ]
    },
    {
      category: 'Health & First Aid',
      icon: '🏥',
      items: [
        { name: 'First aid kits', icon: '🩹', checked: false },
        { name: 'Bandages and gauze', icon: '🧤', checked: false },
        { name: 'Antiseptic wipes', icon: '🧼', checked: false },
        { name: 'Pain relievers', icon: '💊', checked: false },
        { name: 'Thermometers', icon: '🌡️', checked: false },
        { name: 'Disposable gloves', icon: '🧤', checked: false }
      ]
    },
    {
      category: 'Hygiene',
      icon: '🛁',
      items: [
        { name: 'Soap', icon: '🧼', checked: false },
        { name: 'Toothbrush', icon: '🪥', checked: false },
        { name: 'Toothpaste', icon: '🧴', checked: false },
        { name: 'Hand sanitizer', icon: '🧼', checked: false },
        { name: 'Toilet paper', icon: '🧻', checked: false },
        { name: 'Sanitary pads', icon: '🩹', checked: false }
      ]
    },
    {
      category: 'Cleaning Supplies',
      icon: '🧹',
      items: [
        { name: 'Bleach', icon: '🧴', checked: false },
        { name: 'Detergent', icon: '🧼', checked: false },
        { name: 'Scrub brushes', icon: '🪥', checked: false }
      ]
    },
    {
      category: 'Baby & Senior Care',
      icon: '👶',
      items: [
        { name: 'Baby Formula', icon: '🍼', checked: false },
        { name: 'Diapers', icon: '👶', checked: false },
        { name: 'Adult Diapers', icon: '👵', checked: false }
      ]
    },
    {
      category: 'Clothing & Blankets',
      icon: '👕',
      items: [
        { name: 'Adult Clothing', icon: '👕', checked: false },
        { name: 'Children Clothing', icon: '👕', checked: false },
        { name: 'Blankets', icon: '🛌', checked: false }
      ]
    }
  ];

  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'lynk', name: 'Lynk', icon: '📱' }
  ];

  constructor(private impactRequestService: ImpactRequestService) { }

  ngOnInit() {
    this.impactRequestService.requests$.subscribe(requests => {
      this.allRequests = requests;
      if (this.map) {
        this.updateMapMarkers();
      }
    });
  }

  ngAfterViewInit() {
    if (this.donationType === 'impact-map') {
      this.initMap();
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  setDonationType(type: 'monetary' | 'in-kind' | 'impact-map') {
    // Cleanup existing map if switching away from impact-map
    if (this.donationType === 'impact-map' && type !== 'impact-map' && this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
    }

    this.donationType = type;
    this.selectedPaymentMethod = '';
    this.clearCardDetails();

    if (type === 'impact-map') {
      setTimeout(() => this.initMap(), 100);
    }
  }

  private initMap() {
    const mapElement = document.getElementById('impact-map');
    if (!mapElement) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Center on Jamaica
    this.map = L.map('impact-map').setView([18.1096, -77.2975], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMapMarkers();
  }

  private updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    this.allRequests.forEach(req => {
      const marker = L.marker([req.lat, req.lng]).addTo(this.map);

      const popupContent = `
        <div class="map-popup">
          <h3>${req.requesterName} from ${req.location}</h3>
          <p>Needs assistance with:</p>
          <ul>
            ${req.items.map(item => `<li>${item.name} (${item.status})</li>`).join('')}
          </ul>
          <button class="popup-btn" id="fulfill-${req.id}">Fulfill Request</button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`fulfill-${req.id}`);
        if (btn) {
          btn.onclick = () => this.openFulfillment(req);
        }
      });

      this.markers.push(marker);
    });
  }

  openFulfillment(req: ImpactRequest) {
    this.selectedRequest = req;
    this.itemsToFulfill = {};
    req.items.forEach(item => {
      if (item.status === 'pending' || item.status === 'partially-fulfilled') {
        this.itemsToFulfill[item.name] = false;
      }
    });
    this.showFulfillmentModal = true;
    this.map.closePopup();
  }

  closeFulfillment() {
    this.showFulfillmentModal = false;
    this.selectedRequest = null;
  }

  pledgeRequestItem(request: ImpactRequest, item: RequestItem) {
    this.selectedRequest = request;
    this.itemsToFulfill = {};
    this.itemsToFulfill[item.name] = true;
    this.showFulfillmentModal = true;
  }

  submitFulfillment() {
    if (!this.selectedRequest) return;

    const selectedItemNames = Object.keys(this.itemsToFulfill).filter(name => this.itemsToFulfill[name]);

    if (selectedItemNames.length === 0) {
      alert('Please select at least one item to fulfill.');
      return;
    }

    if (!this.donorName || !this.donorPhone || !this.dropOffDate || !this.selectedCenter) {
      alert('Please complete your information and drop-off details.');
      return;
    }

    const updatedRequest = { ...this.selectedRequest };
    updatedRequest.items = updatedRequest.items.map(item => {
      if (selectedItemNames.includes(item.name)) {
        return { ...item, status: 'fulfilled' as const };
      }
      return item;
    });

    // Check if all items are fulfilled
    const allFulfilled = updatedRequest.items.every(item => item.status === 'fulfilled' || item.status === 'received');

    this.impactRequestService.updateRequest(updatedRequest);

    this.pledgedItems = selectedItemNames.map(name => `${name} for ${this.selectedRequest?.requesterName}`);
    this.showSuccessModal = true;
    this.closeFulfillment();

    // Simulate drop-off to transition to 'received' status after a delay
    setTimeout(() => {
      updatedRequest.items = updatedRequest.items.map(item => {
        if (item.status === 'fulfilled') return { ...item, status: 'received' as const };
        return item;
      });
      this.impactRequestService.updateRequest(updatedRequest);
    }, 5000); // 5 seconds for simulation
  }

  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod = methodId;
  }

  toggleItem(item: any) {
    item.checked = !item.checked;
  }

  submitMonetary(amountStr: string) {
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount < 10) {
      alert('The minimum donation amount is $10.00. Please enter a valid value.');
      return;
    }

    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method before proceeding.');
      return;
    }

    if (this.selectedPaymentMethod === 'card') {
      if (!this.cardNumber || !this.cardExpiry || !this.cardCvv) {
        alert('Please complete all credit/debit card fields.');
        return;
      }
      // Simple validation for card length (optional but helps)
      if (this.cardNumber.length < 13) {
        alert('Please enter a valid card number.');
        return;
      }
    }

    this.donationAmount = amount;
    this.showSuccessModal = true;
  }

  submitInKind() {
    const selected: string[] = [];
    this.categorizedItems.forEach(cat => {
      cat.items.forEach(item => {
        if (item.checked) {
          selected.push(item.name);
        }
      });
    });

    if (selected.length === 0) {
      alert('Please select at least one item you wish to donate.');
      return;
    }

    if (!this.donorName || !this.donorPhone || !this.donorEmail || !this.dropOffDate || !this.selectedCenter) {
      alert('Please complete all donor information and drop-off details.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.donorEmail)) {
      alert('Please enter a valid email address.');
      return;
    }

    this.pledgedItems = selected;
    this.showSuccessModal = true;

    // Simulate sending email
    const selectedCenterName = this.donationCenters.find(c => c.id === this.selectedCenter)?.name;
    console.log(`[SIMULATION] Sending confirmation email to ${this.donorEmail}...`);
    console.log(`
      Subject: Donation Pledge Confirmation - JA RELIEF
      
      Dear ${this.donorName},
      
      Thank you for your generous pledge to JA RELIEF!
      
      Your pledged items:
      ${selected.join('\n      ')}
      
      Drop-off Date: ${this.dropOffDate}
      Location: ${selectedCenterName}
      
      We look forward to receiving your contribution.
      
      Best regards,
      The JA RELIEF Team
    `);

    // Reset items for next time
    this.categorizedItems.forEach(cat => {
      cat.items.forEach(item => item.checked = false);
    });
  }

  closeModal() {
    this.showSuccessModal = false;
    this.donationAmount = 0;
    this.pledgedItems = [];
    this.selectedPaymentMethod = '';
    this.clearCardDetails();
  }

  clearCardDetails() {
    this.cardNumber = '';
    this.cardExpiry = '';
    this.cardCvv = '';
    this.cardName = '';
    this.isCardFlipped = false;
    this.donorName = '';
    this.donorPhone = '';
    this.donorEmail = '';
    this.dropOffDate = '';
    this.selectedCenter = '';
  }

  get formattedCardNumber(): string {
    if (!this.cardNumber) return '•••• •••• •••• ••••';
    const clean = this.cardNumber.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const parts = clean.match(/.{1,4}/g) || [];
    return parts.join(' ').padEnd(19, '•').substring(0, 19);
  }
}

