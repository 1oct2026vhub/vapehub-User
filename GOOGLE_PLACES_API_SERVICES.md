# Google Places API Services Required for Address Autocomplete

## 🎯 Quick Answer: Which Services You Need

From your pricing page, you **ONLY need 2 services**:

### ✅ **KEEP ENABLED:**
1. **Autocomplete Session Usage** - For address suggestions as users type
2. **Places API Place Details Essentials** - For retrieving address data when user selects

### ❌ **DISABLE ALL OTHERS:**
- Autocomplete Requests
- Places API Place Details Enterprise
- Places API Place Details Pro
- Places API Place Details Essentials (IDs Only)
- Places API Place Details Enterprise + Atmosphere
- Places API Place Details Photos
- Places API Nearby Search Enterprise
- Places API Nearby Search Pro
- Places API Nearby Search Enterprise + Atmosphere
- Places API Text Search Enterprise
- Places API Text Search Pro
- Places API Text Search Essentials (IDs Only)
- Places API Text Search Enterprise + Atmosphere

---

## Analysis of Your Code Usage

Based on your codebase analysis, your project uses Google Places API **only for address autocomplete functionality** in:
- Checkout page (shipping and billing addresses)
- My Account addresses page

### What Your Code Uses:

1. **Google Places Autocomplete Widget** (Client-side JavaScript)
   - File: `GooglePlacesAutocomplete.tsx`
   - Configuration:
     - `types: ['address']` - Only address suggestions
     - `componentRestrictions: { country: 'UK' }` - UK addresses only
     - `fields: ['address_components', 'formatted_address', 'geometry', 'name']` - Specific fields requested

2. **Place Details** (Implicitly via `getPlace()`)
   - When user selects an address, `getPlace()` is called
   - This internally uses Place Details API to fetch full place information

---

## ✅ REQUIRED Services (Keep Enabled)

Based on your pricing page, you **MUST** keep these services enabled:

### 1. **Autocomplete Session Usage** ✅ REQUIRED
   - **Service Name**: `Autocomplete Session Usage`
   - **Purpose**: Provides address suggestions as users type
   - **Usage**: Used by the `Autocomplete` widget in your code
   - **Billing**: Charged per session (more cost-effective than per-request)
   - **Status**: ✅ **KEEP ENABLED**
   - **Why**: Your code uses session-based autocomplete widget

### 2. **Places API Place Details Essentials** ✅ REQUIRED
   - **Service Name**: `Places API Place Details Essentials`
   - **Purpose**: Retrieves full place information when user selects an address
   - **Usage**: Called automatically when `getPlace()` is executed
   - **Billing**: Charged per request (Essentials tier - most cost-effective)
   - **Status**: ✅ **KEEP ENABLED**
   - **Why**: Your code requests actual address data (`address_components`, `formatted_address`, `geometry`, `name`), not just place IDs
   - **Note**: You need **Essentials** (not "IDs Only") because you extract actual address components from the response

---

## ❌ Services You Can DISABLE (Not Used)

Based on your pricing page, you can **safely disable** these services:

### ❌ **Autocomplete Requests** - DISABLE
   - **Why**: You use session-based autocomplete, not per-request autocomplete
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Place Details Enterprise** - DISABLE
   - **Why**: You don't need enterprise features, Essentials tier is sufficient
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Place Details Pro** - DISABLE
   - **Why**: You don't need pro features, Essentials tier is sufficient
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Place Details Essentials (IDs Only)** - DISABLE
   - **Why**: You need actual address data, not just place IDs
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Place Details Enterprise + Atmosphere** - DISABLE
   - **Why**: You don't need atmosphere data or enterprise features
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Place Details Photos** - DISABLE
   - **Why**: Your code doesn't request photo fields
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Nearby Search Enterprise** - DISABLE
   - **Why**: Not used for address autocomplete
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Nearby Search Pro** - DISABLE
   - **Why**: Not used for address autocomplete
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Nearby Search Enterprise + Atmosphere** - DISABLE
   - **Why**: Not used for address autocomplete
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Text Search Enterprise** - DISABLE
   - **Why**: Your code doesn't use text-based place searches
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Text Search Pro** - DISABLE
   - **Why**: Your code doesn't use text-based place searches
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Text Search Essentials (IDs Only)** - DISABLE
   - **Why**: Your code doesn't use text-based place searches
   - **Status**: ❌ **CAN DISABLE**

### ❌ **Places API Text Search Enterprise + Atmosphere** - DISABLE
   - **Why**: Your code doesn't use text-based place searches
   - **Status**: ❌ **CAN DISABLE**

---

## 📋 How to Disable Unnecessary Services

### Steps in Google Cloud Console:

1. **Go to Google Cloud Console**
   - Navigate to: https://console.cloud.google.com/

2. **Open APIs & Services**
   - Go to: **APIs & Services** → **Library**

3. **Disable Unnecessary APIs**
   - Search for each service listed above under "CAN DISABLE"
   - Click on each service
   - Click **DISABLE** button
   - Confirm the action

### Recommended Actions:

```
✅ KEEP ENABLED (Only 2 services needed):
   1. Autocomplete Session Usage
   2. Places API Place Details Essentials

❌ DISABLE ALL OTHERS:
   - Autocomplete Requests
   - Places API Place Details Enterprise
   - Places API Place Details Pro
   - Places API Place Details Essentials (IDs Only)
   - Places API Place Details Enterprise + Atmosphere
   - Places API Place Details Photos
   - Places API Nearby Search Enterprise
   - Places API Nearby Search Pro
   - Places API Nearby Search Enterprise + Atmosphere
   - Places API Text Search Enterprise
   - Places API Text Search Pro
   - Places API Text Search Essentials (IDs Only)
   - Places API Text Search Enterprise + Atmosphere
```

**Note**: You may also see "Maps JavaScript API" in your enabled APIs. This is required to load the Places library (`&libraries=places`), but you're not displaying maps, so it's minimal usage.

---

## 💰 Cost Optimization Tips

1. **✅ Already Using Session-based Autocomplete**: Your code uses `Autocomplete Session Usage` which is more cost-effective than `Autocomplete Requests` (per-request billing).

2. **✅ Already Using Essentials Tier**: Your code uses `Places API Place Details Essentials` (not Enterprise/Pro), which is the most cost-effective tier for your needs.

3. **✅ Already Requesting Only Needed Fields**: Your code requests only necessary fields:
   ```javascript
   fields: ['address_components', 'formatted_address', 'geometry', 'name']
   ```
   This minimizes Place Details API costs.

4. **✅ Already Restricted to UK**: Your code restricts to UK addresses:
   ```javascript
   componentRestrictions: { country: 'UK' }
   ```
   This helps reduce unnecessary API calls.

5. **Monitor Usage**: Set up billing alerts in Google Cloud Console to monitor usage and prevent unexpected charges.

---

## 🔍 Verification

After disabling services, test your address autocomplete:
1. Go to checkout page
2. Start typing an address in the shipping address field
3. Verify suggestions appear
4. Select an address
5. Verify address fields are populated correctly

If everything works, you've successfully optimized your API usage!

---

## 📝 Notes

- **Maps JavaScript API** is required because the Places library is loaded via:
  ```javascript
  &libraries=places
  ```
  However, you're not displaying maps, so you're only using it for the Places functionality.

- The **Place Details API** is called automatically when `getPlace()` is executed - you don't need to explicitly enable it separately if Places API is enabled.

- If you see any errors after disabling services, re-enable them and check which service is actually being used.
