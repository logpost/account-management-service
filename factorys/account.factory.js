import ShipperAdapter from '../adapters/shipper.adapter'
import CarrierAdapter from '../adapters/carrier.adapter'

class AccountFactory {
    account = {
        shipper: ShipperAdapter,
        carrier: CarrierAdapter
    }
}

export default AccountFactory