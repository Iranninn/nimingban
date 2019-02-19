import React from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, SectionList, Dimensions, TouchableOpacity } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { getForumList } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { Header } from 'react-navigation';
import { configBase, configDynamic } from '../modules/config'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    wlp: {
        height: (Dimensions.get('window').width * 0.7),
        width: (Dimensions.get('window').width * 0.7)
    },
    groupView: {
        paddingLeft: 5,
        backgroundColor: '#D3D3D3',
        marginBottom: 5,
        paddingTop: 8,
        paddingBottom: 8,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
    },
    groupText: {
        color: globalColor,
        fontSize: 20,
    },
    itemView: {
        marginLeft: 10,
        paddingTop: 5,
        paddingBottom: 5
    },
    itemText: {
        fontSize: 20
    },
    bottomTools: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: globalColor
    },
    bottomToolsItem: {

    },
    titleView: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleIsland: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    titleImage: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    titleText: {
        fontSize: 24,
        color: '#FFF'
    }
});


class LeftDrawerNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            forumList: [],
            headerLoading: false,
            showAllIsland: false,
            islandList: []
        };
    }

    componentDidMount() {
        this._refreshIslandList();
        this._pullDownRefresh(false);
    }

    /**
     * 刷新板块列表
     */
    _refreshIslandList = () =>{
        let tempIsland = [];
        for(let key in configBase.islandList) {
            tempIsland.push(
                <TouchableOpacity style={
                    (configDynamic.islandMode==key || this.state.showAllIsland)
                    ?
                    styles.titleIsland
                    :
                    styles.displayNone}
                    onPress={()=>this._onSelectIsland(key)}
                    key={key}>
                <Image source={configBase.islandList[key].logo} style={styles.titleImage} resizeMode={'contain'}></Image>
                <Text style={styles.titleText}>
                    {configBase.islandList[key].displayName}匿名版
                </Text>
                <Icon name={'arrow-down'} size={12} color={'#FFF'}/>
            </TouchableOpacity>
            );
        }
        this.setState({
            islandList: tempIsland
        });
    }
    /**
     * 板块分组
     */
    _renderSectionHeader = ({section}) => {
        return (
            <View style={styles.groupView}>
                <Text style={styles.groupText}>
                    {section.groupName}
                </Text>
            </View>
        );
    }
    /**
     * 切换板块
     */
    _onPressItem = (item)=> {
        this.props.navigation._childrenNavigation.Home.reset([
            NavigationActions.navigate({ 
                routeName: 'Home',
                params: {
                    forumID: item.id,
                    name: item.name
                }
            })
        ], 0);
        this.props.navigation.closeDrawer();
    }

    /**
     * 板块item
     */
    _renderItem = ({item}) => {
        let displayName = item.showName?getHTMLDom(item.showName):getHTMLDom(item.name);
        return(
            <TouchableOpacity onPress={()=>this._onPressItem(item)}>
                <View style={styles.itemView}>
                    <Text style={styles.itemText}>
                    {displayName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * 下拉刷新板块列表
     */
    _pullDownRefresh = (force) => {
        this.setState({
            headerLoading: true
        }, ()=>{
            getForumList(force).then((res) => {
                if(res.status == 'ok') {
                    let tempList = Array();
                    res.res.forEach(forumGroup => {
                        tempList.push({
                            groupName: forumGroup.name,
                            data: forumGroup.forums.slice()
                        });
                    });
                    this.setState({
                        forumList: tempList,
                        headerLoading: false
                    });
                }
                else {
                    alert('获取板块列表失败,' + res.errmsg);
                    this.setState({
                        headerLoading: false
                    });
                }
            }).catch(()=>{
                alert('获取板块列表失败');
                this.setState({
                    headerLoading: false
                });
            });
        });
    }
    /**
     * 更新岛配置，刷新
     */
    _changeIsland = (name) =>{
        if(name != configDynamic.islandMode) {
            configDynamic.islandMode = name;
            this._pullDownRefresh(false);
            this.props.navigation._childrenNavigation.Home.reset([
                NavigationActions.navigate({ 
                    routeName: 'Home',
                    params: {
                        forumID: -1,
                        name: '时间线'
                    }
                })
            ], 0);
        }
    }
    /**
     * 点击了某个岛，开始切换
     */
    _onSelectIsland = (isName)=>{
        if(isName!='ld') {
            this._changeIsland(isName);
        }
        this.setState({
            showAllIsland: !this.state.showAllIsland
        }, this._refreshIslandList);
    }


    render() {
        return (
            <View style={{top: 0, flex:1,flexDirection: 'column', justifyContent:'flex-start', backgroundColor: globalColor}}>
                <View style={{backgroundColor: globalColor, top: 0, minHeight: Header.HEIGHT}}>
                    <SafeAreaView style={[styles.titleView, {minHeight: Header.HEIGHT}]}>
                        {this.state.islandList}
                    </SafeAreaView>
                </View>       
                
                <SectionList
                    style={{backgroundColor: '#FFF'}}
                    onRefresh={()=>this._pullDownRefresh(true)}
                    refreshing={this.state.headerLoading}
                    ListHeaderComponent={<Image style={styles.wlp} resizeMode='contain' resizeMethod='scale' source={require('../imgs/menu-top.jpg')}/>}
                    renderSectionHeader={this._renderSectionHeader}
                    renderItem={this._renderItem}
                    sections={this.state.forumList}
                    keyExtractor={(item, index) => {return index.toString()}}
                />      
                <SafeAreaView>
                    <View style={styles.bottomTools}>
                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity>
                                <Icon name={'settings'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity>
                                <Icon name={'star'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity onPress={()=>this.props.navigation.navigate('UserMember')}>
                                <Icon name={'user'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }
}


export  { LeftDrawerNavigator }