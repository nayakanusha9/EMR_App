import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from '../utils/constants';

export default function PhoneInput({ countryCode, phone, onCountryChange, onPhoneChange }) {
  return (
    <div className="phone-input-group">
      <select
        className="phone-country-select"
        value={countryCode || DEFAULT_COUNTRY_CODE}
        onChange={(e) => onCountryChange(e.target.value)}
      >
        {COUNTRY_CODES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
      <input
        type="tel"
        className="phone-number-input"
        value={phone || ''}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder="Phone number"
      />
    </div>
  );
}
