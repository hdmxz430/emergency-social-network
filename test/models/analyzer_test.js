let expect = require('expect.js');
const {_analyzer} = require('../../models/englishStopWords');

suite('SearchWord Split and StopWords Removal Tests', () => {
    setup(done => {
        done();
    });

    test('Single Word input (Not Stop Word)', done => {
        let searchWord = 'bond';
        let result = _analyzer(searchWord);
        expect(result.length).to.be(1);
        expect(result[0]).to.be('bond');
        done();
    });

    test('Multiple Words input (No Stop Word)', done => {
        let searchWord = 'james  bond';
        let result = _analyzer(searchWord);
        expect(result.length).to.be(2);
        expect(result[0]).to.be('james');
        expect(result[1]).to.be('bond');
        done();
    });

    test('Multiple Words input (With one Stop Word)', done => {
        let searchWord = 'james the bond';
        let result = _analyzer(searchWord);
        expect(result.length).to.be(2);
        expect(result[0]).to.be('james');
        expect(result[1]).to.be('bond');
        done();
    });

    test('Multiple Words input (All Stop Words)', done => {
        let searchWord = 'ever his how why must or';
        let result = _analyzer(searchWord);
        expect(result.length).to.be(0);
        done();
    });

});