/* eslint-disable @typescript-eslint/no-var-requires */
import escpos from 'escpos';
const escposUSB = require('escpos-usb');

escpos.USB = escposUSB;

export const device = new escpos.USB('0x04b8', '0x0202');

export const printer = device ? new escpos.Printer(device, {
   encoding: 'ISO-8859-1'
}) : false;
