import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe('Voucher service test suite', () => {
  it('the voucher must be unique', async () => {
    const voucher = {
      code: 'AAAA10',
      discount: 10
    }
    
    jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementation((): any => {
      return {
        id: 1,
        code: voucher.code,
        discount: voucher.discount,
        used: false
      }
    });

    const promise = voucherService.createVoucher(voucher.code, voucher.discount);
    expect(promise).rejects.toEqual({
      type: 'conflict',
      message: 'Voucher already exist.',
    })
  });

  it('should not apply discount with the same voucher more than once', async () => {
    const voucher = {
      code: 'AAAA10',
      discount: 10
    }

    jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementation((): any => {
      return {
        id: 1,
        code: voucher.code,
        discount: voucher.discount,
        used: true
      }
    });

    const amount = 100;
    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(10);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);   
  });

  it('should not apply discount for invalid voucher', async () => {
    const voucher = {
      code: 'AAAA10',
      discount: 10
    }

    jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementation((): any => {
      return undefined;
    });

    const amount = 100;
    const promise = voucherService.applyVoucher(voucher.code, amount);
    expect(promise).rejects.toEqual({
      type: 'conflict',
      message: 'Voucher does not exist.',
    })
  })

  it('should not apply discount for values below 100', async () => {
    const voucher = {
      code: 'AAAA10',
      discount: 10
    }

    jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementation((): any => {
      return {
        id: 1,
        code: voucher.code,
        discount: voucher.discount,
        used: false
      }
    });

    jest.spyOn(voucherRepository, 'useVoucher').mockImplementation((): any => { });

    const amount = 99;
    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order.amount).toBe(amount);
    expect(order.discount).toBe(10);
    expect(order.finalAmount).toBe(amount);
    expect(order.applied).toBe(false);
  });

  it('should return order data when transition credentials are valid', async () => {
    const voucher = {
      code: 'AAAA10',
      discount: 10
    }

    jest.spyOn(voucherRepository, 'getVoucherByCode').mockImplementation((): any => {
      return {
        id: 1,
        code: voucher.code,
        discount: voucher.discount,
        used: false
      }
    });

    jest.spyOn(voucherRepository, 'useVoucher').mockImplementation((): any => { });

    const amount = 100;
    const order = await voucherService.applyVoucher(voucher.code, amount);
    expect(order).toStrictEqual({
      amount: amount,
      discount: voucher.discount,
      finalAmount: amount*(1 - voucher.discount/100),
      applied: true,
    })
  });
})