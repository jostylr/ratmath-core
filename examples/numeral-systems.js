import {NumeralSystem,Rational} from '../index.js';
for(const spec of [
 {kind:'ordinary',radix:10,tokens:[...'0123456789']},
 {kind:'multiToken',radix:3,tokens:['zero','one','two']},
 {kind:'balanced',radix:3,tokens:['T','0','1']},
 {kind:'negative',radix:-2,tokens:['0','1']},
]) {
 const system=new NumeralSystem(spec),source=new Rational(-7,3),record=system.format(source);
 if(record.status!=='complete'||!system.parse(record.spelling).equals(source))throw new Error('Exact round trip failed');
 console.log(spec.kind,record.spelling,String(source));
}
