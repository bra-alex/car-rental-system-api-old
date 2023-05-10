enum Roles {
  User = 3921,
  Admin = 9291,
  Renter = 6631,
}

enum Availability {
  Available = 1,
  Unavailable = 0,
}

enum Condition {
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
  Excellent = 'Excellent',
}

enum Plan {
  Hourly = '/hr',
  Daily = '/day',
}

enum CarType {
  Bus = 'Bus',
  SUV = 'SUV',
  Van = 'Van',
  Sedan = 'Sedan',
  Pickup = 'Pickup',
  Minivan = 'Minivan',
  Offroad = 'Offroad',
  Hatchback = 'Hatchback',
  Crossover = 'Crossover',
}

enum ReservationStatus {
  Accepted = 'Accepted',
  Pending = 'Pending',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

enum MediaCategory {
  User,
  Car,
}

export { Roles, Availability, Condition, Plan, CarType, ReservationStatus, MediaCategory }
