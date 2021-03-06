/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const { ClientIdentity } = require('fabric-shim');

class Vehicle extends Contract {

    async initLedger(ctx) {


        const cid = new ClientIdentity(ctx.stub);

        const mspID = cid.getMSPID()

        const id = cid.getID();

        return `${mspID} --- ${id}`;

        console.info('============= START : Initialize Vehicle Ledger ===========');
        const registered_vehicles = [
            {
                customer_id: '17653661',
                make: 'Toyota',
                model: 'Prius',
                year: '2020',
                plate_number: 'KUOGN85R3B012814'
            }, {
                customer_id: '17653662',
                make: 'Hyundai',
                model: 'Elentra',
                year: '2020',
                plate_number: 'KUOGN82R3J012909'
            }
        ];

        for (let i = 0; i < registered_vehicles.length; i++) {
            await ctx.stub.putState(registered_vehicles[i].plate_number, Buffer.from(JSON.stringify(registered_vehicles[i])));
            console.info('Added <--> ', registered_vehicles[i]);
        }

        console.info('============= END : Initialize Vehicle Ledger ===========');
    }
    async addVehicle(ctx, customer_id, make, model, year, plate_number) {
        console.info('============= START : Create ledger for Storing Vehicle Information ===========');

        const vehicleDetails = await ctx.stub.getState(plate_number);
        if (!!vehicleDetails) {
            throw new Error(`Vehicle Number: "${plate_number}" already exists!`);
        }

        const vehicle = {
            customer_id,
            make,
            model,
            year,
            plate_number
        };

        await ctx.stub.putState(plate_number, Buffer.from(JSON.stringify(vehicle)));
        console.info('============= END : Create ledger for Storing Vehicle Information ===========');
    }

    async getVehicleInfo(ctx, plate_number) {
        const vehicleDetails = await ctx.stub.getState(plate_number);
        if (!vehicleDetails || vehicleDetails.length === 0) {
            throw new Error(`${plate_number} does not exist`);
        }
        console.log(vehicleDetails.toString());
        return vehicleDetails.toString();
    }

    async queryAllVehicles(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }
}

module.exports = Vehicle;
