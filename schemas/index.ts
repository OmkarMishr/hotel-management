import account from './account';
import booking from './booking';
import hotelRoom from './hotelRoom';
import review from './review';
import user from './user';
import verificationToken from './verifyToken';

export const schemaTypes = [
  user,
  account,
  booking,
  hotelRoom,
  review,
  verificationToken,
];

export default schemaTypes;