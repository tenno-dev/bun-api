import WorldStateEmitter from "worldstate-emitter";
import WorldState from "warframe-worldstate-parser";

export function test(data1, lang) {
    var xs = new WorldState(data1.ws, {
    locale: lang,
    kuvaData: data1.kuva ,
    sentientData: data1.anomaly,
  });
  return JSON.stringify(xs);
}
export function test2(data1, id, lang) {
  var xs = new WorldState(data1.ws, {
    locale: lang,
    kuvaData: data1.kuva ,
    sentientData: data1.anomaly,
  });
  return JSON.stringify(xs?.[id]);
}
