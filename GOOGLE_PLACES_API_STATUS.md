# Google Places API - Enabled/Disabled Services Status

## 📋 Current Project Configuration

**API URL Used:**
```
https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&loading=async
```

**Code Implementation:**
- Uses Google Places Autocomplete Widget (session-based)
- Requests fields: `['address_components', 'formatted_address', 'geometry', 'name']`
- Restricted to UK addresses only
- Used in: Checkout page and My Account addresses page

---

## ✅ REQUIRED SERVICES (Should Be ENABLED)

Based on your code implementation, these services **MUST be enabled**:

### 1. **Maps JavaScript API** ✅ REQUIRED
   - **Status**: Should be **ENABLED**
   - **Why**: Required to load the Places library (`&libraries=places`)
   - **Note**: Even though you're not displaying maps, this API is needed to load the Places functionality
   - **Cost**: 
     - Dynamic Maps: Billed per map load (cost per 1,000 loads)
     - Pricing is tiered by monthly usage volume
     - **Free tier**: Includes monthly free usage cap (resets monthly)
     - **$200 monthly credit** available (check current status)
     - Since you're only loading the library (not displaying maps), costs are minimal
   - **Reference**: [Maps JavaScript API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

### 2. **Places API** ✅ REQUIRED
   - **Status**: Should be **ENABLED**
   - **Why**: Core API for Places functionality
   - **Note**: This is the main Places API that enables all Places services
   - **Cost**: 
     - No direct cost - this is the base API that enables Places services
     - Actual billing occurs for specific Places services (Autocomplete, Place Details, etc.)
     - **Free tier**: Includes monthly free usage caps for Essentials tier services

### 3. **Autocomplete Session Usage** ✅ REQUIRED
   - **Service Name**: `Autocomplete Session Usage`
   - **Status**: Should be **ENABLED**
   - **Why**: Your code uses session-based autocomplete widget (`new google.maps.places.Autocomplete()`)
   - **Billing**: Charged per session (more cost-effective)
   - **Cost**:
     - **Currently FREE** when session completes with Place Details request
     - A session includes one or more Autocomplete requests linked with a Place Details request using the same session token
     - If session is abandoned (no Place Details request), Autocomplete requests are charged at standard per-request rates
     - **Free tier**: Sessions completing with Place Details are free
   - **Reference**: [Autocomplete Session Pricing](https://developers.google.com/maps/documentation/javascript/session-pricing)

### 4. **Places API Place Details Essentials** ✅ REQUIRED
   - **Service Name**: `Places API Place Details Essentials`
   - **Status**: Should be **ENABLED**
   - **Why**: Called automatically when `getPlace()` is executed to retrieve address data
   - **Billing**: Charged per request (Essentials tier)
   - **Note**: You need Essentials (not "IDs Only") because you extract actual address components
   - **Cost**:
     - Pricing varies by monthly usage volume (tiered pricing)
     - **Free tier**: 10,000 requests/month free (70,000 for India-billed accounts)
     - After free tier: Charged per 1,000 requests (rate decreases with higher volume)
     - When used with Autocomplete Session: Receives pricing benefits
     - **$200 monthly credit** applies to eligible SKUs (check current status)
   - **Reference**: [Places API Pricing](https://developers.google.com/maps/billing-and-pricing/pricing)

---

## ❌ SERVICES TO DISABLE (Not Used)

These services are **NOT needed** for your implementation and should be **DISABLED**:

### Autocomplete Services
- ❌ **Autocomplete Requests** - DISABLE
  - **Why**: You use session-based autocomplete, not per-request autocomplete

### Place Details Services
- ❌ **Places API Place Details Enterprise** - DISABLE
- ❌ **Places API Place Details Pro** - DISABLE
- ❌ **Places API Place Details Essentials (IDs Only)** - DISABLE
- ❌ **Places API Place Details Enterprise + Atmosphere** - DISABLE
- ❌ **Places API Place Details Photos** - DISABLE
  - **Why**: Your code doesn't request photo fields

### Nearby Search Services
- ❌ **Places API Nearby Search Enterprise** - DISABLE
- ❌ **Places API Nearby Search Pro** - DISABLE
- ❌ **Places API Nearby Search Enterprise + Atmosphere** - DISABLE
  - **Why**: Not used for address autocomplete functionality

### Text Search Services
- ❌ **Places API Text Search Enterprise** - DISABLE
- ❌ **Places API Text Search Pro** - DISABLE
- ❌ **Places API Text Search Essentials (IDs Only)** - DISABLE
- ❌ **Places API Text Search Enterprise + Atmosphere** - DISABLE
  - **Why**: Your code doesn't use text-based place searches

---

## 🔍 How to Check Your Current Status

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Select your project

### Step 2: View Enabled APIs
1. Navigate to: **APIs & Services** → **Enabled APIs**
2. Search for "Places" or "Maps"
3. Review the list of enabled APIs

### Step 3: Check Billing/Usage
1. Navigate to: **APIs & Services** → **Dashboard**
2. Or go to: **Billing** → **Reports**
3. Filter by "Places API" or "Maps JavaScript API"
4. Review which services are being billed

### Step 4: Verify Service Status
For each service listed above:
- ✅ Check if it's enabled in **APIs & Services** → **Library**
- ✅ Check if it appears in your billing reports
- ✅ Verify it matches the required/disabled list above

---

## 📊 Summary Checklist

### ✅ Keep Enabled (4 APIs):
- [ ] Maps JavaScript API
- [ ] Places API
- [ ] Autocomplete Session Usage (billing service)
- [ ] Places API Place Details Essentials (billing service)

### ❌ Should Be Disabled (13+ services):
- [ ] Autocomplete Requests
- [ ] Places API Place Details Enterprise
- [ ] Places API Place Details Pro
- [ ] Places API Place Details Essentials (IDs Only)
- [ ] Places API Place Details Enterprise + Atmosphere
- [ ] Places API Place Details Photos
- [ ] Places API Nearby Search Enterprise
- [ ] Places API Nearby Search Pro
- [ ] Places API Nearby Search Enterprise + Atmosphere
- [ ] Places API Text Search Enterprise
- [ ] Places API Text Search Pro
- [ ] Places API Text Search Essentials (IDs Only)
- [ ] Places API Text Search Enterprise + Atmosphere

---

## 💡 Important Notes

1. **Maps JavaScript API** is required even if you're not displaying maps because:
   - Your URL includes `&libraries=places`
   - The Places library is loaded via Maps JavaScript API

2. **Billing Services vs APIs**:
   - APIs are enabled/disabled in **APIs & Services** → **Library**
   - Billing services (like "Autocomplete Session Usage") are tracked separately in billing reports
   - Some services may appear in billing even if not explicitly enabled as separate APIs

3. **How to Disable Services**:
   - Go to **APIs & Services** → **Library**
   - Search for the service name
   - Click on it
   - Click **DISABLE**
   - Confirm the action

4. **Testing After Changes**:
   - Test address autocomplete on checkout page
   - Test address autocomplete on My Account addresses page
   - Verify suggestions appear and addresses populate correctly

---

## 🚨 If You See Unexpected Charges

1. Check **Billing** → **Reports** for detailed usage
2. Filter by date range and API name
3. Identify which service is generating charges
4. Verify if it's actually needed for your code
5. Disable unnecessary services

---

## 💰 Cost Summary

### Estimated Monthly Costs (Typical Usage)

For a typical e-commerce site with moderate address autocomplete usage:

1. **Maps JavaScript API** (Dynamic Maps):
   - **Cost**: Minimal (you're only loading the library, not displaying maps)
   - Most usage covered by free tier
   - Estimated: **$0-5/month** for library loads

2. **Places API** (Base API):
   - **Cost**: $0 (no direct billing - enables other services)

3. **Autocomplete Session Usage**:
   - **Cost**: **FREE** ✅ (when session completes with Place Details)
   - Only charged if sessions are abandoned (no Place Details request)

4. **Places API Place Details Essentials**:
   - **Free tier**: 10,000 requests/month free
   - After free tier: Tiered pricing (decreases with volume)
   - **Estimated**: **$0-20/month** for typical usage (assuming <10K requests/month)

### Total Estimated Monthly Cost: **$0-25/month** (with free tier coverage)

### Important Notes:

- **$200 Monthly Credit**: Google provides $200/month credit for eligible SKUs (verify current status)
- **Free Tier**: 10,000 Place Details requests/month are free
- **Session Benefits**: Using Autocomplete Sessions makes Autocomplete requests FREE
- **Volume Discounts**: Pricing decreases automatically as usage increases
- **UK Restriction**: Your code restricts to UK addresses, which helps reduce unnecessary API calls

### Cost Optimization Tips:

1. ✅ **Already Optimized**: You're using session-based autocomplete (FREE)
2. ✅ **Already Optimized**: You're requesting only essential fields
3. ✅ **Already Optimized**: You're restricting to UK addresses only
4. 📊 **Monitor Usage**: Set up billing alerts in Google Cloud Console
5. 🎯 **Stay Within Free Tier**: Most small-to-medium sites stay within 10K requests/month

### To Check Your Actual Costs:

1. Go to **Google Cloud Console** → **Billing** → **Reports**
2. Filter by date range and API name
3. Review actual usage and costs
4. Set up budget alerts to prevent unexpected charges

---

## 📝 Code Reference

Your implementation uses:
- **File**: `front-end/src/components/GooglePlacesAutocomplete.tsx`
- **Configuration**:
  ```typescript
  types: ['address']
  componentRestrictions: { country: 'UK' }
  fields: ['address_components', 'formatted_address', 'geometry', 'name']
  ```
- **Usage**: Session-based autocomplete widget (not REST API calls)

This confirms you only need the 4 services listed under "REQUIRED SERVICES" above.
