import React, { Component } from "react";
import { Link } from "react-router-dom";
let punchingInstance = require('./eth/punching')
let web3 = require('./utils/InitWeb3');
let project = {}
let state = ''
let ddl = ''
let proposals = []
let result = []

class my_launch_punching_detail extends React.Component {
    constructor() {
        super();
        this.state = {
            accounts: '',
            money: 0,
            content: ''
        }
        this.handleChange = this.handleChange.bind(this);
        this.up = this.up.bind(this);
    }
    handleChange(event) {
        // 读取输入的值
        const name = event.target.name;
        const value = event.target.value;
        //   更新状态
        this.setState({
            [name]: value
        })
    }
    componentWillMount = async () => {
        project = {} //清空
        proposals = []
        project = await punchingInstance.methods.allpunchings(this.props.match.params.id).call()
        project.usedMoney = web3.utils.fromWei(project.usedMoney, 'ether')
        project.goalMoney = web3.utils.fromWei(project.goalMoney, 'ether');
        project.raisedMoney = web3.utils.fromWei(project.raisedMoney, 'ether')
        let proposal_length = project.proposalsLength
        for (let i = 0; i < proposal_length; i++) {
            let proposal = {
                content: '',
                amount: 0,
                agreeAmount: 0,
                disAmount: 0,
                goal: 0,
                isAgreed: false,
                p_state: '',
                total: 0
            }
            result = []
            result = await punchingInstance.methods.getProposal(this.props.match.params.id, i + 1).call()
            proposal.content = result[0]
            proposal.amount = result[1]
            proposal.amount = web3.utils.fromWei(proposal.amount, 'ether')
            console.log(proposal.amount)
            proposal.agreeAmount = result[2]
            proposal.agreeAmount = web3.utils.fromWei(proposal.agreeAmount, 'ether')
            proposal.disAmount = result[3]
            proposal.goal = result[4]
            proposal.goal = web3.utils.fromWei(proposal.goal, 'ether')
            proposal.total = 2 * proposal.goal
            proposal.isAgreed = result[5]
            if (proposal.isAgreed) {
                proposal.p_state = "Approved"
            }
            else {
                proposal.p_state = "Unapproved"
            }
            proposals.push(proposal)
        }
        ddl = project.deadline
        let current_time = Date.parse(new Date())
        if (project.isSuccess === true) {
            state = "Finished"
        }
        else {
            if (ddl - current_time >= 0) {
                state = "Ongoing"
            }
            else {
                state = "Expired"
            }
        }
        ddl = (new Date(parseInt(ddl))).toLocaleDateString()
        let accounts = await web3.eth.getAccounts()
        this.setState({
            // manager: manager,
            accounts: accounts
        })
    };
    async up() {

        if (this.state.money === 0) {
            alert('Amount must be larger than 0!')
        }
        else if ((project.raisedMoney - project.usedMoney) < this.state.money) {
            alert('您最多可使用' + (project.raisedMoney - project.usedMoney) + '以太坊')
        }
        else {
            let a = await web3.utils.toWei(this.state.money, 'ether')
            console.log(a)
            await punchingInstance.methods.createProposal(this.props.match.params.id, this.state.content, a).send({
                from: this.state.accounts[0]
            })
            alert('Punched successfully!！')
        }
    }
    render() {
        return (
            <div>
                <nav class="navbar navbar-expand-lg navbar-dark bg-success text-white font-weight-bold">
                    <i className="fas fa-fw fa-2x fa-clock" />
                    <a class="navbar-brand" href="#">Punch Go</a>
                    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mr-auto">
                            <li class="nav-item ">
                                <Link className="nav-link" to='/home'>
                                    <i className="fas fa-fw fa-home" />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li class="nav-item">
                                <Link className="nav-link" to='/allpunchings'>
                                    <i className="fas fa-fw fa-calendar" />
                                    <span>All Punches</span>
                                </Link>
                            </li>
                            <li class="nav-item">
                                <Link className="nav-link" to='/createpunching'>
                                    <i className="fas fa-fw fa-calendar-plus" />
                                    <span>initiate a Punch</span>
                                </Link>
                            </li>
                            <li class="nav-item dropdown active">
                                <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    My punches
                                </a>
                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                    <Link className="dropdown-item" to='/my_launch_punchings'>
                                        {/* <i className="fas fa-fw fa-home" /> */}
                                        <span>Punches Initiated</span>
                                    </Link>
                                    <Link className="dropdown-item" to='/my_joined_punchings'>
                                        {/* <i className="fas fa-fw fa-home" /> */}
                                        <span>Punches Participated</span>
                                    </Link>

                                </div>
                            </li>


                        </ul>
                        <form>
                            {/* className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"> */}
                            <div className="input-group">
                                <input type="text" className="form-control bg-light border-0 small"
                                    placeholder="Search Punches"
                                    aria-label="Search" aria-describedby="basic-addon2" />
                                <div className="input-group-append">
                                    <button className="btn btn-light" type="button">
                                        <i className="fas fa-search fa-sm" />
                                    </button>
                                </div>
                            </div>
                        </form>
                        <a class="nav-item dropdown ml-3
                        ">
                            <img className="img-profile rounded-circle dropdown-toggle" src="img/man.svg" width="30px" id="navbarDropdown1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />



                            {/* <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    User Info
                                </a> */}
                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown1">
                                <Link className="dropdown-item" to='/my_launch_punchings'>
                                    {/* <i className="fas fa-fw fa-home" /> */}
                                    <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                                        Current Account Address：{this.state.accounts[0]}</span>
                                </Link>

                            </div>
                        </a>


                    </div>
                </nav>
                <div id="wrapper" className="pt-4" >

                    

                    <div id="content-wrapper" className="d-flex flex-column">


                        <div id="content">

                            

                            <div class="container-fluid">
                                <div className="card shadow mb-4">
                                    <div className="card-header py-3">
                                        <h5 className="m-0 font-weight-bold text-primary">Activity Details <a href="#" className="btn btn-success btn-icon-split" style={{ float: "right" }}
                                            data-target="#myModal" data-toggle="modal">
                                            <span className="text">Punch</span>
                                        </a></h5>

                                        <div className="modal fade" id="myModal" tabIndex="-1" role="dialog"
                                            aria-labelledby="myModalLabel" aria-hidden="true">
                                            <div className="modal-dialog">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h4 className="modal-title" id="myModalLabel">
                                                            Please enter punch content
                                                        </h4>
                                                        <button type="button" className="close" data-dismiss="modal"
                                                            aria-hidden="true">
                                                            &times;
                                                        </button>
                                                    </div>
                                                    <div className="modal-body">
                                                        <label htmlFor="name">Punch Day</label>
                                                        <input type="number" min="0"
                                                            className="form-control form-control-user" name="money"
                                                            value={this.state.money} onChange={this.handleChange} />
                                                    </div>
                                                    <div className="modal-body">
                                                        <label htmlFor="name">Punch Content</label>
                                                        <textarea className="form-control" rows="5" name="content"
                                                            value={this.state.overview}
                                                            onChange={this.handleChange} />
                                                    </div>
                                                    <div className="modal-footer">
                                                        <a className="btn btn-secondary btn-user btn-block"
                                                            type='submit' data-dismiss="modal">
                                                            Close
                                                        </a>
                                                        <a className="btn btn-success btn-user btn-block" type='submit'
                                                            onClick={this.up} data-dismiss="modal">
                                                            Submit
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-responsive" class="row">
                                                <div className="col-lg-12">
                                                    <div className="card mb-4 py-3 border-left-success">
                                                        <div className="card-body">
                                                            <h5>Activity Initiator：<strong>{project.initiator}</strong></h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-lg-6">
                                                    <div className="card mb-4 py-3 border-left-primary">
                                                        <div className="card-body">
                                                            <h5>Activity Name：<strong>{project.title}</strong><span className="badge badge-info ml-3">Activity Deadline：{ddl}</span></h5>
                                                        </div>
                                                    </div>
                                                    <div className="card mb-4 py-3 border-left-secondary">
                                                        <div className="card-body">
                                                            <h5>Activity Status：<strong>{state}</strong></h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="card mb-4 py-3 border-left-info">
                                                        <div className="card-body">
                                                            <h5>Activity Deposit：<strong>{project.goalMoney}eth</strong></h5>
                                                        </div>
                                                    </div>
                                                    <div className="card mb-4 py-3 border-left-warning">
                                                        <div className="card-body">
                                                            <h5>Current Total Deposit：<strong>{project.raisedMoney - project.usedMoney}eth</strong></h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="card mb-4 py-3 border-left-danger">
                                                        <div className="card-body">
                                                            <h5>Remaining Participators：<strong>{project.usedMoney}</strong></h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="card mb-4 py-3 border-left-warning">
                                                        <div className="card-body">
                                                            <h5>Number of Participators：<strong>{project.fundersLength}</strong></h5>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-lg-12">
                                                    <div className="card mb-4 py-3 border-left-dark">
                                                        <div className="card-body">
                                                            <h5>Activity Description：</h5>
                                                            <p>
                                                                <strong>{project.content}</strong>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card shadow mb-4">
                                    <div className="card-header py-3">
                                        <div className="container-fluid">
                                            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                                                <h5 className="m-0 font-weight-bold text-primary">Punch Details</h5>
                                            </div>
                                            <div className="col-lg-12">
                                                {
                                                    (proposals.length === 0)
                                                        ? null
                                                        : proposals.map((item, index) => {
                                                            return (
                                                                <div className="card mb-4 py-3 border-left-dark">
                                                                    <div className="card-body">
                                                                        <div className="row">
                                                                            <div className="col-xl-6 col-md-6 mb-4">
                                                                                <div className="card border-left-success shadow h-100 py-2">
                                                                                    <div className="card-body">
                                                                                        <div className="row no-gutters align-items-center">
                                                                                            <div className="col mr-2">
                                                                                                <div
                                                                                                    className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                                                                                    Punch Day
                                                                                                </div>
                                                                                                <div className="h5 mb-0 font-weight-bold text-gray-800">{item.amount}</div>
                                                                                            </div>
                                                                                            <div className="col-auto">
                                                                                                <i className="fas fa-dollar-sign fa-2x text-gray-300" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-xl-6 col-md-6 mb-4">
                                                                                <div className="card border-left-info shadow h-100 py-2">
                                                                                    <div className="card-body">
                                                                                        <div className="row no-gutters align-items-center">
                                                                                            <div className="col mr-2">
                                                                                                <div
                                                                                                    className="text-xs font-weight-bold text-info text-uppercase mb-1">Agreed Percentage
                                                                                                </div>
                                                                                                <div className="row no-gutters align-items-center">
                                                                                                    <div className="col-auto">
                                                                                                        <div
                                                                                                            className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{(item.agreeAmount / item.total).toFixed(4) * 100}%
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="col">
                                                                                                        <div className="progress progress-sm mr-2">
                                                                                                            <div className="progress-bar bg-info" role="progressbar"
                                                                                                                style={{ width: (item.agreeAmount / item.total) * 100 + '%' }} aria-valuenow="50"
                                                                                                                aria-valuemin="0"
                                                                                                                aria-valuemax="100" />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div className="col-auto">
                                                                                                <i className="fas fa-clipboard-list fa-2x text-gray-300" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="col-xl-12 col-md-6 mb-4">
                                                                                <div className="card border-left-warning shadow h-100 py-2">
                                                                                    <div className="card-body">
                                                                                        <div className="row no-gutters align-items-center">
                                                                                            <div className="col mr-2">
                                                                                                <div
                                                                                                    className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                                                                                    Punch Content
                                                                                                </div>
                                                                                                <div className="h5 mb-0 font-weight-bold text-gray-800">{item.content}</div>
                                                                                            </div>
                                                                                            <div className="col-auto">
                                                                                                <i className="fas fa-comments fa-2x text-gray-300" />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }, this)
                                                }
                                            </div>

                                        </div>
                                        <div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default my_launch_punching_detail;