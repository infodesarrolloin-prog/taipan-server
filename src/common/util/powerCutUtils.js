const POWER_CUT_ON_RE = /(?:seco on received|dout2 on)/i;
const POWER_CUT_OFF_RE = /(?:seco off received|dout2 off)/i;
const IGNITION_OFF_RE = /(?:ignition\s*off|estado apagado|apagado)/i;
const ALARM_ON_RE = /(?:dout1\s*:\s*1|dout1\s*on)/i;
const ALARM_OFF_RE = /(?:dout1\s*:\s*0|dout1\s*off)/i;

const extractAttributes = (value = {}) => {
  if (value && typeof value === 'object') {
    if (value.attributes && typeof value.attributes === 'object') {
      return value.attributes;
    }
    return value;
  }
  return {};
};

export const getPositionResultText = (positionOrAttributes = {}) => {
  const attrs = extractAttributes(positionOrAttributes);
  const fallback =
    typeof positionOrAttributes === 'object' && positionOrAttributes !== attrs
      ? positionOrAttributes.result
      : undefined;

  const value =
    attrs.result ||
    attrs.command ||
    attrs.commandResult ||
    attrs.eventCommandResult ||
    fallback ||
    '';
  return String(value).trim();
};

export const isPowerCutFromAttributes = (positionOrAttributes = {}) => {
  const attrs = extractAttributes(positionOrAttributes);
  return (
    attrs.blocked === true ||
    attrs.out2 === true ||
    attrs.dout2 === true ||
    attrs.out2 === 1 ||
    attrs.dout2 === 1
  );
};

export const isPowerCutResultText = (positionOrAttributes = {}) =>
  POWER_CUT_ON_RE.test(getPositionResultText(positionOrAttributes));

export const isPowerRestoreResultText = (positionOrAttributes = {}) =>
  POWER_CUT_OFF_RE.test(getPositionResultText(positionOrAttributes));

export const isIgnitionOffResultText = (positionOrAttributes = {}) =>
  IGNITION_OFF_RE.test(getPositionResultText(positionOrAttributes));

export const getAlarmResultState = (positionOrAttributes = {}) => {
  const text = getPositionResultText(positionOrAttributes);
  if (ALARM_OFF_RE.test(text)) return false;
  if (ALARM_ON_RE.test(text)) return true;
  return null;
};

export const isPowerCutPosition = (positionOrAttributes = {}) =>
  isPowerCutFromAttributes(positionOrAttributes) ||
  isPowerCutResultText(positionOrAttributes);
