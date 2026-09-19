import {expect,test} from 'bun:test';
import {NumeralSystem,NUMERAL_SYSTEM_SCHEMA,Integer,Rational} from '../index.js';
const systems=[
 new NumeralSystem({radix:10,tokens:[...'0123456789']}),
 new NumeralSystem({kind:'multiToken',radix:3,tokens:['zero','one','two']}),
 new NumeralSystem({kind:'balanced',radix:3,tokens:['T','0','1']}),
 new NumeralSystem({kind:'negative',radix:-2,tokens:['0','1']}),
];
test('all four families roundtrip signed rationals and repeat boundaries with independent carry identities',()=>{
 for(const system of systems)for(let n=-30;n<=30;n++)for(let d=1;d<=19;d++){
  const source=new Rational(n,d),result=system.format(source);
  expect(result.status).toBe('complete');expect(system.parse(result.spelling).equals(source)).toBe(true);
  for(const carry of result.integer.carries)expect(carry.after*BigInt(system.radix)+BigInt(carry.digit)).toBe(carry.before);
  for(const step of result.steps)expect(step.before.multiply(new Rational(system.radix)).subtract(new Rational(step.digit)).equals(step.after)).toBe(true);
  const fraction=system.format(source,{mode:'fraction'});expect(system.parse(fraction.spelling).equals(source)).toBe(true);
 }
});
test('versioning and alphabets reject collisions and preserve explicit digit values',()=>{
 for(const spec of [{radix:2,tokens:['a','ab'],kind:'multiToken'},{radix:2,tokens:['0','0']},{radix:2,tokens:['0','-']},{radix:2,tokens:['aa','b']},{kind:'balanced',radix:4,tokens:[...'0123']},{kind:'negative',radix:2,tokens:['0','1']},{schema:'future',radix:2,tokens:['0','1']}])expect(()=>new NumeralSystem(spec)).toThrow();
 for(const s of systems){const copy=new NumeralSystem(JSON.parse(JSON.stringify(s)));expect(copy.toJSON()).toEqual(s.toJSON());expect(copy.schema).toBe(NUMERAL_SYSTEM_SCHEMA);}
 expect(systems[1].parse('onezero.two').equals(new Rational(11,3))).toBe(true);
 expect(systems[2].parse('1T').equals(new Rational(2))).toBe(true);
 expect(systems[3].parse('110.1').equals(new Rational(3,2))).toBe(true);
});
test('exact compound grammar has explicit unsupported and malformed diagnostics',()=>{
 const s=systems[0];for(const [source,value]of [['-2..1/3',new Rational(-7,3)],['3.~7~16',new Rational(355,113)],['0.1#6',new Rational(1,6)],['12.5_^2',new Rational(1250)],['1_000/2',new Rational(500)]])expect(s.parse(source).equals(value)).toBe(true);
 for(const source of ['.','1__0','_1','1_','1#','1/0','1:2','1?2','1_^^2','1.2.3','1.~0','2..-1/3'])expect(()=>s.parse(source)).toThrow();
});
test('work exhaustion preserves exact source, carries and fractional remainder without an exact spelling',()=>{
 for(const s of systems){const source=new Rational(1,97),result=s.format(source,{maxDigits:3});expect(result.status).toBe('budgetExhausted');expect(result.spelling).toBeNull();expect(result.source.equals(source)).toBe(true);expect(result.work).toBeLessThanOrEqual(3);expect(result.remaining).toBeInstanceOf(Rational);}
 expect(systems[0].format(new Integer(10000),{maxDigits:2}).integer.remaining).toBe(100n);
 expect(systems[0].format(new Rational(0),{maxDigits:0}).status).toBe('budgetExhausted');
 expect(()=>systems[0].format(new Rational(1n<<16384n))).toThrow('16384');expect(()=>systems[0].parse('1'.repeat(4097))).toThrow('budget');expect(()=>systems[0].format(new Rational(1),{maxDigits:4097})).toThrow('4096');
});
test('locale profiles are reversible formatting adapters with strict grouping',()=>{
 const s=systems[0],locale={point:',',group:' ',groupSize:3};
 const localized=s.locale('12345.6#7',locale);expect(localized).toBe('12 345,6#7');expect(s.locale(localized,locale,'parse').equals(s.parse('12345.6#7'))).toBe(true);
 expect(()=>s.locale('1 2345,6',locale,'parse')).toThrow('grouping');expect(()=>s.locale('12.3',{point:'0',group:','})).toThrow('collides');expect(()=>s.locale('1/2',locale)).toThrow('positional');
 for(const system of systems){const source=system.format(new Rational(-1234,7)).spelling,localized=system.locale(source,{point:',',group:' ',groupSize:2});expect(system.locale(localized,{point:',',group:' ',groupSize:2},'parse').equals(new Rational(-1234,7))).toBe(true);}
 for(const profile of [{point:'x.y',group:'.'},{point:'.',group:'x.y'}]){const encoded=s.locale('1234.5',profile);expect(s.locale(encoded,profile,'parse').equals(new Rational(2469,2))).toBe(true);}
 const words=new NumeralSystem({kind:'multiToken',radix:2,tokens:['ab','cd']});const profile={point:'.',group:'bc',groupSize:2};const encoded=words.locale('cdabcdab.cd',profile);expect(words.locale(encoded,profile,'parse').equals(words.parse('cdabcdab.cd'))).toBe(true);
});
test('place explanations reconstruct exact signed values independently',()=>{
 for(const [system,source]of [[systems[0],'-12.25'],[systems[1],'onetwo.zeroone'],[systems[2],'T1.1T'],[systems[3],'110.11']]){
  const explanation=system.places(source);let sum=new Rational(0);for(const row of explanation.places)sum=sum.add(row.contribution);expect(sum.equals(explanation.value)).toBe(true);
 }
 expect(systems[0].places('1/3').diagnostic).toContain('Compound');
});

test('higher signed radices and boundary remainders retain exactness',()=>{
 for(const radix of [-3,-4,-5,-7,5,7,9]){
  const b=Math.abs(radix),kind=radix<0?'negative':'balanced',tokens=Array.from({length:b},(_,i)=>String.fromCharCode(65+i)),system=new NumeralSystem({kind,radix,tokens});
  for(let numerator=-12;numerator<=12;numerator++)for(let denominator=1;denominator<=11;denominator++){
   const value=new Rational(numerator,denominator),result=system.format(value);expect(result.status).toBe('complete');expect(system.parse(result.spelling).equals(value)).toBe(true);
  }
 }
});
