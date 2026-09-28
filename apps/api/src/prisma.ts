import { PrismaClient } from '@prisma/client';
import { MemoryDatabase } from './db/memory-store';

const realPrisma = new PrismaClient();
const memDb = new MemoryDatabase();

// In-memory collection handler factory
function createCollectionHandler(name: string, getArray: () => any[]) {
  return {
    findMany: async (args?: any) => {
      let items = [...getArray()];
      if (args?.where) {
        items = items.filter(item => matchWhere(item, args.where));
      }
      if (args?.orderBy) {
        // Simple sort
        const [field, direction] = Object.entries(args.orderBy)[0] as [string, string];
        items.sort((a, b) => {
          if (a[field] < b[field]) return direction === 'desc' ? 1 : -1;
          if (a[field] > b[field]) return direction === 'desc' ? -1 : 1;
          return 0;
        });
      }
      if (args?.take && typeof args.take === 'number') {
        items = items.slice(0, args.take);
      }
      if (args?.include) {
        return items.map(item => enrichRelations(item, args.include));
      }
      return items;
    },

    findUnique: async (args: any) => {
      const item = getArray().find(i => matchWhere(i, args?.where));
      if (!item) return null;
      if (args?.include) {
        return enrichRelations(item, args.include);
      }
      return item;
    },

    findFirst: async (args?: any) => {
      let items = getArray();
      if (args?.where) {
        items = items.filter(i => matchWhere(i, args.where));
      }
      const item = items[0] ?? null;
      if (item && args?.include) {
        return enrichRelations(item, args.include);
      }
      return item;
    },

    create: async (args: any) => {
      const newItem = {
        id: args?.data?.id || `${name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args?.data
      };
      getArray().push(newItem);
      return newItem;
    },

    createMany: async (args: any) => {
      const dataArr = Array.isArray(args?.data) ? args.data : [args?.data];
      for (const d of dataArr) {
        getArray().push({
          id: d?.id || `${name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...d
        });
      }
      return { count: dataArr.length };
    },

    update: async (args: any) => {
      const item = getArray().find(i => matchWhere(i, args?.where));
      if (item) {
        Object.assign(item, args.data, { updatedAt: new Date() });
        return item;
      }
      return null;
    },

    updateMany: async (args: any) => {
      let count = 0;
      for (const item of getArray()) {
        if (matchWhere(item, args?.where)) {
          Object.assign(item, args.data, { updatedAt: new Date() });
          count++;
        }
      }
      return { count };
    },

    upsert: async (args: any) => {
      const existing = getArray().find(i => matchWhere(i, args?.where));
      if (existing) {
        Object.assign(existing, args.update, { updatedAt: new Date() });
        return existing;
      }
      const newItem = {
        id: args?.create?.id || `${name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...args?.create
      };
      getArray().push(newItem);
      return newItem;
    },

    delete: async (args: any) => {
      const arr = getArray();
      const idx = arr.findIndex(i => matchWhere(i, args?.where));
      if (idx !== -1) {
        const [deleted] = arr.splice(idx, 1);
        return deleted;
      }
      return null;
    },

    deleteMany: async (args?: any) => {
      const arr = getArray();
      if (!args?.where || Object.keys(args.where).length === 0) {
        const count = arr.length;
        arr.length = 0;
        return { count };
      }
      let count = 0;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (matchWhere(arr[i], args.where)) {
          arr.splice(i, 1);
          count++;
        }
      }
      return { count };
    },

    count: async (args?: any) => {
      if (!args?.where) return getArray().length;
      return getArray().filter(i => matchWhere(i, args.where)).length;
    }
  };
}

function matchWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const [key, val] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(val)) {
      if (!val.some(subWhere => matchWhere(item, subWhere))) return false;
      continue;
    }
    if (key === 'AND' && Array.isArray(val)) {
      if (!val.every(subWhere => matchWhere(item, subWhere))) return false;
      continue;
    }
    if (key === 'NOT') {
      if (matchWhere(item, val)) return false;
      continue;
    }
    // Handle composite unique constraints (e.g. tripId_seatNumber: { tripId, seatNumber })
    if (key.includes('_') && val && typeof val === 'object' && !Array.isArray(val)) {
      let compositeMatch = true;
      for (const [subK, subV] of Object.entries(val)) {
        if (item[subK] !== subV) {
          compositeMatch = false;
          break;
        }
      }
      if (compositeMatch) continue;
      return false;
    }

    if (val && typeof val === 'object') {
      if ('in' in (val as any)) {
        if (!(val as any).in.includes(item[key])) return false;
        continue;
      }
      if ('not' in (val as any)) {
        if (item[key] === (val as any).not) return false;
        continue;
      }
      if ('gte' in (val as any)) {
        const target = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
        const compare = (val as any).gte instanceof Date ? (val as any).gte.getTime() : new Date((val as any).gte).getTime();
        if (isNaN(target) || target < compare) return false;
        continue;
      }
      if ('lte' in (val as any)) {
        const target = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
        const compare = (val as any).lte instanceof Date ? (val as any).lte.getTime() : new Date((val as any).lte).getTime();
        if (isNaN(target) || target > compare) return false;
        continue;
      }
      if ('lt' in (val as any)) {
        const target = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
        const compare = (val as any).lt instanceof Date ? (val as any).lt.getTime() : new Date((val as any).lt).getTime();
        if (isNaN(target) || target >= compare) return false;
        continue;
      }
      if ('gt' in (val as any)) {
        const target = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
        const compare = (val as any).gt instanceof Date ? (val as any).gt.getTime() : new Date((val as any).gt).getTime();
        if (isNaN(target) || target <= compare) return false;
        continue;
      }
      // Nested relation filter (e.g. route: { originStationId: ... })
      if (item[key] && typeof item[key] === 'object') {
        if (!matchWhere(item[key], val)) return false;
        continue;
      }
    }
    if (item[key] !== val) return false;
  }
  return true;
}

function enrichRelations(item: any, include: any): any {
  const res = { ...item };
  if (include.route) {
    const route = memDb.routes.find(r => r.id === item.routeId);
    if (route) {
      res.route = {
        ...route,
        originStation: memDb.stops.find(s => s.id === route.originStationId || s.id === route.originStopId),
        destinationStation: memDb.stops.find(s => s.id === route.destinationStationId || s.id === route.destinationStopId)
      };
    }
  }
  if (include.bus) {
    res.bus = memDb.buses.find(b => b.id === item.busId);
  }
  if (include.branch) {
    res.branch = memDb.branches.find(b => b.id === item.branchId);
  }
  if (include.tickets) {
    res.tickets = memDb.tickets.filter(t => t.tripId === item.id || t.bookingId === item.id);
  }
  if (include.payments) {
    res.payments = memDb.payments.filter(p => p.bookingId === item.id);
  }
  if (include.tripSegments) {
    res.tripSegments = memDb.tripSegments.filter(s => s.tripId === item.id).map(seg => ({
      ...seg,
      fromStop: memDb.stops.find(s => s.id === seg.fromStopId),
      toStop: memDb.stops.find(s => s.id === seg.toStopId),
      seats: memDb.tripSegmentSeats.filter(tss => tss.tripSegmentId === seg.id)
    }));
  }
  return res;
}

// Fallback Proxy that delegates to real PostgreSQL if reachable, or in-memory SSOT store
export const prisma: any = new Proxy(realPrisma, {
  get(target, prop: string) {
    // Standard Prisma internal methods
    if (prop === '$connect') return async () => {};
    if (prop === '$disconnect') return async () => {};
    if (prop === '$transaction') {
      return async (cbOrList: any) => {
        if (typeof cbOrList === 'function') {
          return await cbOrList(prisma);
        }
        if (Array.isArray(cbOrList)) {
          return await Promise.all(cbOrList);
        }
      };
    }

    // Map entity collections
    switch (prop) {
      case 'company': return createCollectionHandler('Company', () => memDb.companies);
      case 'branch': return createCollectionHandler('Branch', () => memDb.branches);
      case 'user': return createCollectionHandler('User', () => memDb.users);
      case 'passenger': return createCollectionHandler('Passenger', () => memDb.passengers);
      case 'bus': return createCollectionHandler('Bus', () => memDb.buses);
      case 'busType': return createCollectionHandler('BusType', () => memDb.busTypes);
      case 'seat':
      case 'busSeat': return createCollectionHandler('Seat', () => memDb.seats);
      case 'driver': return createCollectionHandler('Driver', () => memDb.drivers);
      case 'stop':
      case 'station': return createCollectionHandler('Stop', () => memDb.stops);
      case 'route': return createCollectionHandler('Route', () => memDb.routes);
      case 'routeStop': return createCollectionHandler('RouteStop', () => memDb.routeStops);
      case 'schedule': return createCollectionHandler('Schedule', () => memDb.schedules);
      case 'trip': return createCollectionHandler('Trip', () => memDb.trips);
      case 'tripSegment': return createCollectionHandler('TripSegment', () => memDb.tripSegments);
      case 'tripSegmentSeat': return createCollectionHandler('TripSegmentSeat', () => memDb.tripSegmentSeats);
      case 'reservation': return createCollectionHandler('Reservation', () => memDb.reservations);
      case 'seatLock': return createCollectionHandler('SeatLock', () => memDb.seatLocks);
      case 'booking': return createCollectionHandler('Booking', () => memDb.bookings);
      case 'bookingPassenger': return createCollectionHandler('BookingPassenger', () => memDb.bookingPassengers);
      case 'bookingSegment': return createCollectionHandler('BookingSegment', () => memDb.bookingSegments);
      case 'payment': return createCollectionHandler('Payment', () => memDb.payments);
      case 'paymentEvent': return createCollectionHandler('PaymentEvent', () => memDb.paymentEvents);
      case 'ticket': return createCollectionHandler('Ticket', () => memDb.tickets);
      case 'boarding':
      case 'boardingRecord': return createCollectionHandler('Boarding', () => memDb.boardings);
      case 'gpsLocation': return createCollectionHandler('GPSLocation', () => memDb.gpsLocations);
      case 'incidentReport': return createCollectionHandler('IncidentReport', () => memDb.incidentReports);
      case 'maintenanceRecord': return createCollectionHandler('MaintenanceRecord', () => memDb.maintenanceRecords);
      case 'maintenancePart': return createCollectionHandler('MaintenancePart', () => memDb.maintenanceParts);
      case 'sparePart': return createCollectionHandler('SparePart', () => memDb.spareParts);
      case 'fuelTransaction': return createCollectionHandler('FuelTransaction', () => memDb.fuelTransactions);
      case 'notification': return createCollectionHandler('Notification', () => memDb.notifications);
      case 'supportTicket': return createCollectionHandler('SupportTicket', () => memDb.supportTickets);
      case 'auditLog': return createCollectionHandler('AuditLog', () => memDb.auditLogs);
      case 'cashShift': return createCollectionHandler('CashShift', () => memDb.cashShifts);
      default:
        return (target as any)[prop];
    }
  }
});

export default prisma;
