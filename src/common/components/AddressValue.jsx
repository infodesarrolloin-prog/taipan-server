import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from './LocalizationProvider';
import { formatAddress } from '../util/formatter';
import { usePreference } from '../util/preferences';
import fetchOrThrow from '../util/fetchOrThrow';

const addressCache = {};

window.clearAddressCache = () => {
  Object.keys(addressCache).forEach((key) => {
    delete addressCache[key];
  });
};

const AddressValue = ({ latitude, longitude, originalAddress, positionKey }) => {
  const t = useTranslation();

  const addressEnabled = useSelector((state) => state.session.server.geocoderEnabled);
  const coordinateFormat = usePreference('coordinateFormat');

  const [address, setAddress] = useState(originalAddress || null);
  const previousCacheKey = useRef(null);

  const formatNominatimAddress = (result) => {
    const { address: components, display_name } = result || {};
    if (!components) return display_name || null;

    const streetName =
      components.road ||
      components.residential ||
      components.pedestrian ||
      components.footway ||
      components.path ||
      components.street ||
      components.neighbourhood;
    const houseNumber = components.house_number || components.housenumber;
    if (streetName && houseNumber) {
      return `${streetName} ${houseNumber}`;
    }
    if (display_name) {
      return display_name;
    }
    return formatAddress({ latitude, longitude }, coordinateFormat);
  };

  const fetchReverseGeocoding = async () => {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.search = new URLSearchParams({
      lat: latitude,
      lon: longitude,
      format: 'jsonv2',
      addressdetails: '1',
      zoom: '18',
    }).toString();
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    const data = await response.json();
    return formatNominatimAddress(data);
  };

  useEffect(() => {
    const cacheKey = `${latitude.toFixed(5)},${longitude.toFixed(5)}`;

    if (originalAddress) {
      previousCacheKey.current = cacheKey;
      setAddress(originalAddress);
      return;
    }

    if (addressCache[cacheKey]) {
      previousCacheKey.current = cacheKey;
      setAddress(addressCache[cacheKey]);
      return;
    }

    if (previousCacheKey.current === cacheKey && address) {
      return;
    }

    setAddress(null);

    let active = true;
    const fetchAddress = async () => {
      const formattedFallback = formatAddress({ latitude, longitude }, coordinateFormat);
      try {
        if (addressEnabled) {
          const query = new URLSearchParams({ latitude, longitude });
          const response = await fetchOrThrow(`/api/server/geocode?${query.toString()}`);
          const text = (await response.text()).trim();
          if (text) {
            addressCache[cacheKey] = text;
            if (active) {
              previousCacheKey.current = cacheKey;
              setAddress(text);
            }
            return;
          }
        }

        const nominatimAddress = await fetchReverseGeocoding();
        if (active && nominatimAddress) {
          addressCache[cacheKey] = nominatimAddress;
          previousCacheKey.current = cacheKey;
          setAddress(nominatimAddress);
          return;
        }
      } catch {
        // ignore and fallback below
      }

      if (active) {
        addressCache[cacheKey] = formattedFallback;
        previousCacheKey.current = cacheKey;
        setAddress(formattedFallback);
      }
    };

    fetchAddress();
    return () => {
      active = false;
    };
  }, [latitude, longitude, originalAddress, addressEnabled, coordinateFormat, positionKey, address]);

  if (address) {
    return address;
  }
  return formatAddress({ latitude, longitude }, coordinateFormat);
};

export default AddressValue;
