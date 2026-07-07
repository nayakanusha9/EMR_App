import { MessageCircle, MessagesSquare, Mail } from 'lucide-react';
import { whatsappUrl, smsUrl, mailtoUrl } from '../utils/patientForm';

export default function PatientContactIcons({ patient, size = 16, onClick }) {
  const wa = whatsappUrl(patient);
  const sms = smsUrl(patient);
  const mail = mailtoUrl(patient);

  const stop = (e) => e.stopPropagation();

  return (
    <div className="contact-icons" onClick={stop}>
      {wa ? (
        <a href={wa} target="_blank" rel="noreferrer" className="icon-action icon-whatsapp" aria-label="WhatsApp" onClick={onClick}>
          <MessageCircle size={size} />
        </a>
      ) : (
        <span className="icon-action icon-disabled" aria-hidden="true"><MessageCircle size={size} /></span>
      )}
      {sms ? (
        <a href={sms} className="icon-action icon-sms" aria-label="SMS" onClick={onClick}>
          <MessagesSquare size={size} />
        </a>
      ) : (
        <span className="icon-action icon-disabled" aria-hidden="true"><MessagesSquare size={size} /></span>
      )}
      {mail ? (
        <a href={mail} className="icon-action icon-email" aria-label="Email" onClick={onClick}>
          <Mail size={size} />
        </a>
      ) : (
        <span className="icon-action icon-disabled" aria-hidden="true"><Mail size={size} /></span>
      )}
    </div>
  );
}
