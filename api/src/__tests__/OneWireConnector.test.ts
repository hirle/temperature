import OneWireConnector from '../OneWireConnector';

describe('OneWireConnector', () => {
    
    it('should decode properly positive value', async () => {

        const path = 'src/__tests__/data/frame.positive.txt';
        const underTest = new OneWireConnector( path );

        return underTest.readOneTemperature( )
            .then( value => {
                expect(value).toBe(10.062);
            })
        
    });


    it('should decode properly negative value', async () => {

        const path = 'src/__tests__/data/frame.negative.txt';
        const underTest = new OneWireConnector( path );

        return underTest.readOneTemperature( )
            .then( value => {
                expect(value).toBe(-15.812);
            })
        
    });
});