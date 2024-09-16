import { CoreOutput } from '../../common/dtos/output.dto';

export interface SendSuccessfulPaymentEmailInput {
  items: {
    image: string;
    product_name: string;
    scent: string;
    price: string;
    quantity: string;
    product_total_price: string;
  }[];
  sub_total: string;
  shipping: string;
  discount: string;
  tax: string;
  total: string;
  email: string;
  order_code: string;
  created_at: string;
  name: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

export interface SendSuccessfulPaymentEmailOutput extends CoreOutput {}
