import {MachineID} from '../util/MachineIDs';
import {MachineIDs} from '../util/MachineIDs';
import {Firestore} from '../firebase/Firestore';
import {ISODateTimeString} from '../metadata/ISODateTimeStrings';
import {ISODateTimeStrings} from '../metadata/ISODateTimeStrings';
import {Logger} from '../logger/Logger';

const log = Logger.create();

/**
 * Does one thing.. records the machine ID to the table and the time it was
 * created so that we can track if we have any issues with our analytics.
 */
export class UniqueMachines {

    public static async write() {

        const firestore = await Firestore.getInstance();

        const id = MachineIDs.get();

        const ref = firestore.collection("unique_machines")
            .doc(id);

        const createRecord = async (): Promise<UniqueMachine> => {

            const doc = await ref.get();

            if (doc.exists) {

                const existing: UniqueMachine = <any> doc.data()!;

                const record: UniqueMachine = {
                    machine: existing.machine,
                    created: existing.created,
                    updated: ISODateTimeStrings.create()
                };

                return record;

            }

            const now = ISODateTimeStrings.create();

            const record: UniqueMachine = {
                machine: id,
                created: now,
                updated: now
            };

            return record;

        };

        const record = await createRecord();

        await ref.set(record);

    }


    public static trigger() {

        this.write()
            .catch(err => console.error("Unable to write unique machine record: ", err));

    }

}

interface UniqueMachine {

    readonly machine: MachineID;

    /**
     * The time we FIRST saw this machine.
     */
    readonly created: ISODateTimeString;

    /**
     * The last time this machine was updated/seen.
     *
     */
    readonly updated: ISODateTimeString;

}