"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.datesAreOnSameDay = void 0;
const datesAreOnSameDay = (first, second) => first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();
exports.datesAreOnSameDay = datesAreOnSameDay;
