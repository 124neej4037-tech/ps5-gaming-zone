/**
 * Bandhilki Dynamic Pricing Calculator
 * Computes exact itemized pricing based on real pricing settings stored in Firestore
 */

export function calculateItemizedPrice(service, options, pricingRates) {
  const taxRate = (pricingRates.taxRatePercent || 5) / 100;
  let basePrice = 0;
  let extraPlayersFee = 0;
  let addOnsFee = 0;
  let securityDeposit = 0;
  const lineItems = [];

  switch (service) {
    case 'ps5_gaming': {
      const duration = Number(options.durationHours) || 1;
      const playerCount = Number(options.playerCount) || 1;
      const mode = options.mode || (playerCount > 1 ? 'multiplayer' : 'solo');
      const ps5Rates = pricingRates.ps5Gaming || {};

      const hourlyRate = mode === 'multiplayer' 
        ? (ps5Rates.baseHourlyRateMulti || 220)
        : (ps5Rates.baseHourlyRateSolo || 150);

      basePrice = hourlyRate * duration;
      lineItems.push({
        label: `PS5 Station (${mode === 'multiplayer' ? 'Multiplayer 2P' : 'Solo'}) × ${duration} hr`,
        amount: basePrice
      });

      // Extra players if > 2
      if (playerCount > 2) {
        const extraCount = playerCount - 2;
        const extraPerHr = ps5Rates.extraPlayerHourly || 60;
        extraPlayersFee = extraCount * extraPerHr * duration;
        lineItems.push({
          label: `Extra Players (${extraCount} players) × ₹${extraPerHr}/hr × ${duration} hr`,
          amount: extraPlayersFee
        });
      }

      // Add-ons
      if (options.addons && Array.isArray(options.addons)) {
        options.addons.forEach(addon => {
          if (addon === 'pulse3dHeadset' || addon === 'headset') {
            const cost = (ps5Rates.controllerAddons?.pulse3dHeadset || 50) * duration;
            addOnsFee += cost;
            lineItems.push({ label: `Pulse 3D Wireless Headset × ${duration} hr`, amount: cost });
          } else if (addon === 'dualSenseEdge' || addon === 'proController') {
            const cost = (ps5Rates.controllerAddons?.dualSenseEdge || 70) * duration;
            addOnsFee += cost;
            lineItems.push({ label: `DualSense Edge Pro Controller × ${duration} hr`, amount: cost });
          }
        });
      }
      break;
    }

    case 'movie_theatre': {
      const duration = Number(options.durationHours) || 2;
      const theatreRates = pricingRates.movieTheatre || {};
      const hourlyRate = theatreRates.baseHourlyRate || 750;

      basePrice = hourlyRate * duration;
      lineItems.push({
        label: `Private 4K Dolby Atmos Theatre Room (${duration} hrs)`,
        amount: basePrice
      });

      const snackPackage = options.snackPackage || 'none';
      if (theatreRates.snackPackages && theatreRates.snackPackages[snackPackage]) {
        const snackCost = theatreRates.snackPackages[snackPackage];
        if (snackCost > 0) {
          addOnsFee += snackCost;
          lineItems.push({
            label: `Snack Combo (${snackPackage === 'vipCombo' ? 'VIP Gourmet Box' : 'Regular Popcorn & Soda'})`,
            amount: snackCost
          });
        }
      }
      break;
    }

    case 'home_rental': {
      const rentalRates = pricingRates.homeRental || {};
      const period = options.rentalPeriod || 'dailyRate';
      let periodLabel = '1 Day (24 Hours)';
      let periodCost = rentalRates.dailyRate || 1199;

      if (period === 'weekend3DayRate' || period === '3_day_weekend') {
        periodCost = rentalRates.weekend3DayRate || 2899;
        periodLabel = 'Weekend 3-Day Blast (Fri-Sun)';
      } else if (period === 'weeklyRate' || period === '1_week') {
        periodCost = rentalRates.weeklyRate || 5999;
        periodLabel = 'Weekly Pass (7 Days)';
      }

      basePrice = periodCost;
      lineItems.push({
        label: `PS5 Console Home Rental (${periodLabel})`,
        amount: basePrice
      });

      // Extra controllers
      const extraControllers = Number(options.extraControllers) || 0;
      if (extraControllers > 0) {
        const dailyExtraRate = rentalRates.extraControllerDaily || 150;
        const days = period === 'weeklyRate' || period === '1_week' ? 7 : (period === 'weekend3DayRate' || period === '3_day_weekend' ? 3 : 1);
        extraPlayersFee = extraControllers * dailyExtraRate * days;
        lineItems.push({
          label: `Extra DualSense Controller(s) × ${extraControllers} (${days} days)`,
          amount: extraPlayersFee
        });
      }

      // Security Deposit
      securityDeposit = rentalRates.securityDeposit || 4000;
      lineItems.push({
        label: `Security Deposit (100% Refundable upon console return)`,
        amount: securityDeposit,
        isRefundable: true
      });
      break;
    }

    case 'birthday_party': {
      const partyRates = pricingRates.birthdayParty || {};
      const packages = partyRates.packages || {};
      const selectedTier = options.packageTier || 'silver';
      const pkg = packages[selectedTier] || packages.silver || { price: 3499, name: 'Silver Neon Clash', includedGuests: 6 };

      basePrice = pkg.price;
      lineItems.push({
        label: `Party Package: ${pkg.name}`,
        amount: basePrice
      });

      const guestCount = Number(options.guestCount) || pkg.includedGuests || 6;
      if (guestCount > (pkg.includedGuests || 6)) {
        const extraGuests = guestCount - (pkg.includedGuests || 6);
        const feePerGuest = partyRates.extraGuestFee || 250;
        extraPlayersFee = extraGuests * feePerGuest;
        lineItems.push({
          label: `Extra Guests (${extraGuests} guests) × ₹${feePerGuest}`,
          amount: extraPlayersFee
        });
      }

      // Add-ons for party
      if (options.addons && Array.isArray(options.addons)) {
        if (options.addons.includes('customCake')) {
          addOnsFee += 1200;
          lineItems.push({ label: 'Custom 1.5kg PS5 Controller Cake', amount: 1200 });
        }
        if (options.addons.includes('proPhotographer')) {
          addOnsFee += 1500;
          lineItems.push({ label: 'Pro Cyberpunk Event Photographer & Video Reel', amount: 1500 });
        }
      }
      break;
    }

    default:
      basePrice = 150;
      lineItems.push({ label: 'General Gaming Fee', amount: 150 });
  }

  // Taxable subtotal (excludes refundable security deposit)
  const taxableSubtotal = basePrice + extraPlayersFee + addOnsFee;
  const taxes = Math.round(taxableSubtotal * taxRate);
  const subtotal = taxableSubtotal;
  const total = taxableSubtotal + taxes + securityDeposit;

  return {
    basePrice,
    extraPlayersFee,
    addOnsFee,
    securityDeposit,
    subtotal,
    taxRatePercent: pricingRates.taxRatePercent || 5,
    taxes,
    total,
    lineItems
  };
}
