'use strict';
import _ from 'underscore';
import {PFLog, PFConsole} from './PFLog';
import TAS from 'exports-loader?TAS!TheAaronSheet';
import * as SWUtils from './SWUtils';
import PFConst from './PFConst';
import * as PFUtils  from './PFUtils';

/****************************ASYNCRHOUNOUS UTILITIES ***********************************
 ***************************************************************************************/
/** setDropdownValue
 * Looks at a dropdown selected value, finds the matching attribute value, and then
 * sets the writeFields with that number.
 *  If writeField is a string not an Array, then set old value as 2nd param (could be NaN)
 *
 * @param {string} from the dropdpown field
 * @param {string} to One string or an array of strings that are fields to which we write the new value
 * @param {function(new,old,changed)} callback - the function passed to setDropdownValue as its callback, that function calls it
 * @param {boolean} silently if quiet or not
 */
export function setDropdownValue (readField, writeFields, callback, silently) {
    SWUtils.setDropdownValue(readField, writeFields, PFUtils.findAbilityInString, callback, silently);
}
/** calls setDropdownValue for a dropdown in a repeating section
 * @param {string} section the string between "repeating_" and "_<id>"
 * @param {string} id optional- the id of this row, blank if in context of the current row 
 * @param {string} from the attribute name of the dropdown , string after "repeating_section_id_"
 * @param {string} to the attribute to write to, string after "repeating_section_id_"
 * @param {string} useFindAbility true if @{} around value 
 * @param {function(new,old,changed)} callback - the function passed to setDropdownValue as its callback, that function calls it
 * @param {boolean} silently if quiet or not
 */
export function setRepeatingDropdownValue (section, id, from, to, callback,silently,useFindAbility) {
    var idStr = SWUtils.getRepeatingIDStr(id),
    prefix = "repeating_" + section + "_" + idStr,
    functionToPass = null;
    if(useFindAbility){
        functionToPass=PFUtils.findAbilityInString;
    }
    //setDropdownValue(prefix + from, prefix + to, callback,silently);
    SWUtils.setDropdownValue(prefix + from,  prefix + to, functionToPass, callback, silently);
}
/** setRowIds
 * sets the ID fields and new_flag fields for all rows in the section
 * @param {string} section  = the fieldset name after "section_"
 */
export function setRowIds (section) {
    getSectionIDs("repeating_" + section, function (ids) {
        var setter = {};
        _.each(ids, function (id) {
            setter["repeating_" + section + "_" + id + "_row_id"] = id;
        });
        SWUtils.setWrapper(setter);
    });
}
export function registerEventHandlers() {
    //REPEATING SECTIONS set IDs
    _.each(PFConst.repeatingSections, function (section) {
        var eventToWatch = "change:repeating_" + section + ":ids-show";
        on(eventToWatch, TAS.callback(function eventCheckIsNewRow(eventInfo) {
            var setter={},id;
            TAS.debug("caught " + eventInfo.sourceAttribute + " event: " + eventInfo.sourceType);
            if (eventInfo.sourceType === "player" || eventInfo.sourceType === "api") {
                id = SWUtils.getRowId(eventInfo.sourceAttribute);
                setter["repeating_" + section + "_"+id+"_row_id"]=id;
                SWUtils.setWrapper(setter,PFConst.silentParams);
            }
        }));
    });
}

registerEventHandlers();
//PFConsole.log('   PFUtilsAsync module loaded     ' );
//PFLog.modulecount++;
