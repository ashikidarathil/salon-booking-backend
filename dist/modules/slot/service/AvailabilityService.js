"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const tsyringe_1 = require("tsyringe");
const tokens_1 = require("../../../common/di/tokens");
const slot_constants_1 = require("../constants/slot.constants");
const booking_model_1 = require("../../../models/booking.model");
const mongoose_util_1 = require("../../../common/utils/mongoose.util");
const app_constants_1 = require("../../../common/constants/app.constants");
const slot_helpers_1 = require("./slot.helpers");
let AvailabilityService = class AvailabilityService {
    constructor(slotRepo, holidayRepo, slotValidator) {
        this.slotRepo = slotRepo;
        this.holidayRepo = holidayRepo;
        this.slotValidator = slotValidator;
        this.SALOON_OFFSET_MINS = app_constants_1.SALOON_TIMEZONE_OFFSET;
    }
    async getDynamicAvailability(branchId, date, userIdOrStylistId, duration, includeAll = false, serviceId) {
        if (serviceId && !duration) {
            const branchService = await this.slotRepo.findBranchService(branchId, serviceId);
            if (branchService) {
                duration = branchService.duration;
            }
        }
        const queryDate = new Date(date);
        queryDate.setUTCHours(0, 0, 0, 0);
        const nowBoundary = new Date();
        nowBoundary.setUTCHours(0, 0, 0, 0);
        const maxDate = new Date(nowBoundary.getTime() + 14 * 24 * 60 * 60 * 1000);
        if (queryDate < nowBoundary || queryDate > maxDate) {
            return [];
        }
        const realNow = new Date();
        const saloonNow = new Date(realNow.getTime() + this.SALOON_OFFSET_MINS * 60000);
        const currentSaloonMinutes = saloonNow.getUTCHours() * 60 + saloonNow.getUTCMinutes();
        const saloonDateStr = saloonNow.getUTCFullYear() +
            '-' +
            String(saloonNow.getUTCMonth() + 1).padStart(2, '0') +
            '-' +
            String(saloonNow.getUTCDate()).padStart(2, '0');
        let stylistIds = [];
        if (userIdOrStylistId) {
            const resolved = await (0, slot_helpers_1.resolveStylistId)(userIdOrStylistId, this.slotRepo);
            stylistIds = [resolved];
        }
        else {
            stylistIds = await this.slotRepo.findActiveStylistIds(branchId);
        }
        if (stylistIds.length === 0)
            return [];
        const [stylistsData, branchData, customBreaks, allBookings, allOffDays, allOverrides, allWeeklySchedules, holidays, allSpecialSlots,] = await Promise.all([
            this.slotRepo.findStylistsByIds(stylistIds),
            this.slotRepo.findBranchById(branchId),
            this.slotRepo.findStylistBreaks(branchId, stylistIds, queryDate.getUTCDay(), queryDate),
            this.slotRepo.findBookings(branchId, stylistIds, queryDate),
            this.slotRepo.findOffDays(stylistIds, queryDate),
            this.slotRepo.findDailyOverrides(branchId, stylistIds, queryDate),
            this.slotRepo.findWeeklySchedules(branchId, stylistIds, queryDate.getUTCDay()),
            this.holidayRepo.find({
                $or: [{ branchId: null, isAllBranches: true }, { branchId: (0, mongoose_util_1.toObjectId)(branchId) }],
                date: queryDate,
            }),
            this.slotRepo.findSpecialSlots(branchId, stylistIds, queryDate),
        ]);
        const stylistInfoMap = new Map(stylistsData.map((s) => [s._id.toString(), s]));
        const defaultBreaks = branchData?.defaultBreaks || [
            { startTime: '13:00', endTime: '14:00', description: slot_constants_1.SLOT_LABELS.LUNCH_BREAK },
            { startTime: '16:00', endTime: '16:30', description: slot_constants_1.SLOT_LABELS.TEA_BREAK },
        ];
        const breakMap = new Map();
        customBreaks.forEach((b) => {
            const sid = b.stylistId.toString();
            if (!breakMap.has(sid))
                breakMap.set(sid, []);
            breakMap.get(sid)?.push({
                startTime: b.startTime,
                endTime: b.endTime,
                description: b.description || slot_constants_1.SLOT_LABELS.GENERIC_BREAK,
            });
        });
        const bookingMap = new Map();
        allBookings.forEach((b) => {
            const sid = b.stylistId.toString();
            if (!bookingMap.has(sid))
                bookingMap.set(sid, []);
            bookingMap.get(sid)?.push(b);
            b.items?.forEach((item) => {
                const itemSid = item.stylistId.toString();
                if (itemSid !== sid) {
                    if (!bookingMap.has(itemSid))
                        bookingMap.set(itemSid, []);
                    bookingMap.get(itemSid)?.push(b);
                }
            });
        });
        const offDayMap = new Map(allOffDays.map((od) => [od.stylistId.toString(), od]));
        const overrideMap = new Map(allOverrides.map((o) => [o.stylistId.toString(), o]));
        const weeklyScheduleMap = new Map(allWeeklySchedules.map((ws) => [ws.stylistId.toString(), ws]));
        const holiday = holidays[0];
        if (holiday) {
            return [
                {
                    id: `${slot_constants_1.SLOT_PREFIXES.HOLIDAY}${branchId}_${queryDate.toISOString().split('T')[0]}`,
                    branchId,
                    stylistId: slot_constants_1.SLOT_LABELS.SYSTEM,
                    stylistName: slot_constants_1.SLOT_LABELS.SYSTEM,
                    stylistEmail: '',
                    date: queryDate.toISOString(),
                    startTime: '00:00',
                    endTime: '23:59',
                    startTimeUTC: queryDate.toISOString(),
                    status: slot_constants_1.SlotStatus.HOLIDAY,
                    note: `${slot_constants_1.SLOT_LABELS.HOLIDAY_PREFIX}${holiday.name}`,
                    createdAt: queryDate.toISOString(),
                    updatedAt: queryDate.toISOString(),
                },
            ];
        }
        const allSlots = [];
        const requestedDuration = duration || slot_constants_1.SLOT_GRID_SIZE;
        for (const stylistId of stylistIds) {
            const stylistData = stylistInfoMap.get(stylistId);
            const stylistName = stylistData?.userId?.name || slot_constants_1.SLOT_LABELS.UNKNOWN;
            const stylistEmail = stylistData?.userId?.email || '';
            const offDay = offDayMap.get(stylistId);
            const schedule = (overrideMap.get(stylistId) || weeklyScheduleMap.get(stylistId));
            if (offDay || !schedule || !schedule.isWorkingDay) {
                if (includeAll || userIdOrStylistId) {
                    let status = slot_constants_1.SlotStatus.NON_WORKING;
                    if (offDay)
                        status = slot_constants_1.SlotStatus.OFF_DAY;
                    else if (!schedule)
                        status = slot_constants_1.SlotStatus.NO_SCHEDULE;
                    allSlots.push({
                        id: `status_${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}`,
                        branchId,
                        stylistId,
                        stylistName,
                        stylistEmail,
                        date: queryDate.toISOString(),
                        startTime: '00:00',
                        endTime: '23:59',
                        startTimeUTC: queryDate.toISOString(),
                        status,
                        createdAt: queryDate.toISOString(),
                        updatedAt: queryDate.toISOString(),
                    });
                }
                continue;
            }
            const shifts = (schedule.shifts || []);
            const stylistBreaks = breakMap.get(stylistId)?.length
                ? breakMap.get(stylistId)
                : defaultBreaks;
            const bookingsForStylist = bookingMap.get(stylistId) || [];
            for (const shift of shifts) {
                const start = (0, slot_helpers_1.timeToMinutes)(shift.startTime);
                const end = (0, slot_helpers_1.timeToMinutes)(shift.endTime);
                for (let t = start; t + requestedDuration <= end; t += slot_constants_1.SLOT_GRID_SIZE) {
                    const slotStart = t;
                    const slotEnd = t + requestedDuration;
                    const startTimeStr = (0, slot_helpers_1.minutesToTime)(slotStart);
                    const endTimeStr = (0, slot_helpers_1.minutesToTime)(slotEnd);
                    const virtualId = `${slot_constants_1.SLOT_PREFIXES.DYNAMIC}${branchId}_${stylistId}_${queryDate.toISOString().split('T')[0]}_${startTimeStr}_${endTimeStr}`;
                    const isBreak = stylistBreaks.some((b) => {
                        const bStart = (0, slot_helpers_1.timeToMinutes)(b.startTime);
                        const bEnd = (0, slot_helpers_1.timeToMinutes)(b.endTime);
                        return slotStart < bEnd && slotEnd > bStart;
                    });
                    if (isBreak) {
                        if (includeAll) {
                            allSlots.push({
                                id: virtualId,
                                branchId,
                                stylistId,
                                stylistName,
                                stylistEmail,
                                date: queryDate.toISOString(),
                                startTime: startTimeStr,
                                endTime: endTimeStr,
                                startTimeUTC: new Date(queryDate.getTime() + slotStart * 60000).toISOString(),
                                status: slot_constants_1.SlotStatus.BREAK,
                                createdAt: queryDate.toISOString(),
                                updatedAt: queryDate.toISOString(),
                            });
                        }
                        continue;
                    }
                    let status = slot_constants_1.SlotStatus.AVAILABLE;
                    let note;
                    // Check if a CANCELLED (blocked) special slot covers this time slot
                    const blockedSpecialSlot = allSpecialSlots.find((ss) => {
                        if (ss.stylistId.toString() !== stylistId)
                            return false;
                        const ssStart = (0, slot_helpers_1.timeToMinutes)(ss.startTime);
                        const ssEnd = (0, slot_helpers_1.timeToMinutes)(ss.endTime);
                        return ss.status === 'CANCELLED' && slotStart < ssEnd && slotEnd > ssStart;
                    });
                    if (blockedSpecialSlot) {
                        status = slot_constants_1.SlotStatus.BLOCKED;
                        note = blockedSpecialSlot.note || slot_constants_1.SLOT_LABELS.BLOCKED_NOTE;
                    }
                    else {
                        for (const b of bookingsForStylist) {
                            const isBlocked = b.status === booking_model_1.BookingStatus.BLOCKED;
                            const bookingIntervals = isBlocked
                                ? [
                                    {
                                        start: (0, slot_helpers_1.timeToMinutes)(b.startTime),
                                        end: (0, slot_helpers_1.timeToMinutes)(b.endTime),
                                    },
                                ]
                                : (b.items || [])
                                    .filter((i) => i.stylistId.toString() === stylistId)
                                    .map((i) => ({
                                    start: (0, slot_helpers_1.timeToMinutes)(i.startTime),
                                    end: (0, slot_helpers_1.timeToMinutes)(i.endTime),
                                }));
                            const overlapped = bookingIntervals.some((interval) => slotStart < interval.end && slotEnd > interval.start);
                            if (overlapped) {
                                status = isBlocked ? slot_constants_1.SlotStatus.BLOCKED : slot_constants_1.SlotStatus.BOOKED;
                                note = b.notes || (isBlocked ? slot_constants_1.SLOT_LABELS.BLOCKED_NOTE : undefined);
                                break;
                            }
                        }
                    }
                    if (!includeAll && userIdOrStylistId && status !== slot_constants_1.SlotStatus.AVAILABLE)
                        continue;
                    if (queryDate.toISOString().split('T')[0] === saloonDateStr &&
                        slotStart < currentSaloonMinutes + 30)
                        continue;
                    allSlots.push({
                        id: virtualId,
                        branchId,
                        stylistId,
                        stylistName,
                        stylistEmail,
                        date: queryDate.toISOString(),
                        startTime: startTimeStr,
                        endTime: endTimeStr,
                        startTimeUTC: new Date(queryDate.getTime() + slotStart * 60000).toISOString(),
                        status,
                        note,
                        createdAt: queryDate.toISOString(),
                        updatedAt: queryDate.toISOString(),
                    });
                }
            }
        }
        allSpecialSlots.forEach((ss) => {
            const ssStart = (0, slot_helpers_1.timeToMinutes)(ss.startTime);
            const ssEnd = (0, slot_helpers_1.timeToMinutes)(ss.endTime);
            const reqDuration = duration || 0;
            if (reqDuration > ssEnd - ssStart)
                return;
            const sid = ss.stylistId.toString();
            const stylistData = stylistInfoMap.get(sid);
            if (!stylistData)
                return;
            const bookingsForStylist = bookingMap.get(sid) || [];
            let currentStatus = slot_constants_1.SlotStatus.SPECIAL;
            for (const b of bookingsForStylist) {
                const intervals = b.status === booking_model_1.BookingStatus.BLOCKED
                    ? [
                        {
                            start: (0, slot_helpers_1.timeToMinutes)(b.startTime),
                            end: (0, slot_helpers_1.timeToMinutes)(b.endTime),
                        },
                    ]
                    : (b.items || [])
                        .filter((i) => i.stylistId.toString() === sid)
                        .map((i) => ({
                        start: (0, slot_helpers_1.timeToMinutes)(i.startTime),
                        end: (0, slot_helpers_1.timeToMinutes)(i.endTime),
                    }));
                if (intervals.some((interval) => ssStart < interval.end && ssEnd > interval.start)) {
                    currentStatus = slot_constants_1.SlotStatus.BOOKED;
                    break;
                }
            }
            allSlots.push({
                id: `${slot_constants_1.SLOT_PREFIXES.SPECIAL}${ss._id}`,
                branchId,
                stylistId: sid,
                stylistName: stylistData.userId?.name || slot_constants_1.SLOT_LABELS.UNKNOWN,
                stylistEmail: stylistData.userId?.email || '',
                date: queryDate.toISOString(),
                startTime: ss.startTime,
                endTime: ss.endTime,
                startTimeUTC: new Date(queryDate.getTime() + ssStart * 60000).toISOString(),
                status: currentStatus,
                price: ss.price,
                note: ss.note,
                createdAt: ss.createdAt.toISOString(),
                updatedAt: ss.updatedAt.toISOString(),
            });
        });
        return allSlots.sort((a, b) => a.startTime.trim().localeCompare(b.startTime.trim()));
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotRepository)),
    __param(1, (0, tsyringe_1.inject)(tokens_1.TOKENS.HolidayRepository)),
    __param(2, (0, tsyringe_1.inject)(tokens_1.TOKENS.SlotValidator)),
    __metadata("design:paramtypes", [Object, Object, Object])
], AvailabilityService);
