// @flow

const styles = (active?: boolean) => ({
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  textBackground: {
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    borderRadius: 14,
    backgroundColor: active ? 'white' : 'transparent',
  },
  growingText: {
    fontSize: 11,
    color: active ? '#33333d' : 'white',
  },
  decliningText: {
    fontSize: 11,
    color: active ? '#33333d' : 'white',
  },
  buttonsView: {
    flex: 1,
    flexDirection: 'row',
    height: 80,
  },
});

export default styles;
